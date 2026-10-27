#include <iostream>
#include <string>
#include <chrono>
#include <memory>
#include "httplib.h"
#include "json.hpp"
#include "StudentManager.hpp"

using json = nlohmann::json;
using namespace tracker;

int main(int argc, char* argv[]) {
    int port = 8080;
    std::string dataPath = "backend/data/students.json";

    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
        } catch (...) {
            std::cerr << "Invalid port argument, falling back to 8080" << std::endl;
        }
    }
    if (argc > 2) {
        dataPath = argv[2];
    }

    std::cout << "=========================================================\n";
    std::cout << "  Smart Student Performance Tracker - C++17 REST API     \n";
    std::cout << "=========================================================\n";
    std::cout << "Starting C++ backend on port " << port << "...\n";
    std::cout << "Database storage path: " << dataPath << "\n";

    auto startTime = std::chrono::steady_clock::now();
    StudentManager manager(dataPath);

    httplib::Server svr;

    // CORS pre-flight handler for all routes
    svr.Options(".*", [](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        res.set_header("Access-Control-Max-Age", "86400");
        res.status = 204;
    });

    // Global middleware for setting standard headers
    svr.set_post_routing_handler([](const httplib::Request&, httplib::Response& res) {
        res.set_header("Access-Control-Allow-Origin", "*");
        res.set_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.set_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        if (!res.has_header("Content-Type")) {
            res.set_header("Content-Type", "application/json; charset=utf-8");
        }
    });

    // 1. GET /api/health
    svr.Get("/api/health", [&manager, startTime](const httplib::Request&, httplib::Response& res) {
        auto now = std::chrono::steady_clock::now();
        auto uptimeSecs = std::chrono::duration_cast<std::chrono::seconds>(now - startTime).count();

        json j;
        j["status"] = "healthy";
        j["engine"] = "C++17 Native HTTP Server (cpp-httplib)";
        j["version"] = "1.0.0";
        j["uptimeSeconds"] = uptimeSecs;
        j["authoritativeSource"] = "C++ Backend Service";
        j["activeStudents"] = manager.getAllStudents().size();

        res.status = 200;
        res.set_content(j.dump(), "application/json");
    });

    // 2. GET /api/subjects
    svr.Get("/api/subjects", [](const httplib::Request&, httplib::Response& res) {
        json j = SUBJECTS;
        res.status = 200;
        res.set_content(j.dump(), "application/json");
    });

    // 3. GET /api/students
    svr.Get("/api/students", [&manager](const httplib::Request& req, httplib::Response& res) {
        std::string search = "";
        if (req.has_param("q")) {
            search = req.get_param_value("q");
        } else if (req.has_param("search")) {
            search = req.get_param_value("search");
        }

        auto students = manager.getAllStudents(search);
        json j = students;
        res.status = 200;
        res.set_content(j.dump(), "application/json");
    });

    // 4. GET /api/students/{id}
    svr.Get(R"(/api/students/([0-9]+))", [&manager](const httplib::Request& req, httplib::Response& res) {
        try {
            int id = std::stoi(req.matches[1]);
            auto studentOpt = manager.getById(id);
            if (!studentOpt.has_value()) {
                json err;
                err["error"] = "Student with ID " + std::to_string(id) + " not found";
                res.status = 404;
                res.set_content(err.dump(), "application/json");
                return;
            }

            // Find rank
            auto rankings = manager.getRankings();
            int rank = 0;
            for (size_t i = 0; i < rankings.size(); ++i) {
                if (rankings[i]["id"] == id) {
                    rank = static_cast<int>(i + 1);
                    break;
                }
            }

            json j = studentOpt->toJson(rank);
            res.status = 200;
            res.set_content(j.dump(), "application/json");
        } catch (const std::exception& e) {
            json err;
            err["error"] = std::string("Invalid request: ") + e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        }
    });

    // 5. POST /api/students
    svr.Post("/api/students", [&manager](const httplib::Request& req, httplib::Response& res) {
        try {
            if (req.body.empty()) {
                json err;
                err["error"] = "Request body cannot be empty";
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            json body = json::parse(req.body);

            if (!body.contains("id") || !body["id"].is_number_integer()) {
                json err;
                err["error"] = "Field 'id' is required and must be an integer";
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            if (!body.contains("name") || !body["name"].is_string()) {
                json err;
                err["error"] = "Field 'name' is required and must be a string";
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            int id = body["id"].get<int>();
            std::string name = body["name"].get<std::string>();

            std::vector<double> marksVec;
            if (body.contains("marks") && body["marks"].is_array()) {
                for (const auto& item : body["marks"]) {
                    if (item.is_number()) {
                        marksVec.push_back(item.get<double>());
                    }
                }
            } else if (body.contains("subjectMarks") && body["subjectMarks"].is_object()) {
                for (const auto& subj : SUBJECTS) {
                    if (body["subjectMarks"].contains(subj) && body["subjectMarks"][subj].is_number()) {
                        marksVec.push_back(body["subjectMarks"][subj].get<double>());
                    }
                }
            }

            auto [valid, validationError] = Student::validate(id, name, marksVec);
            if (!valid) {
                json err;
                err["error"] = validationError;
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            std::array<double, SUBJECT_COUNT> marksArr;
            for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
                marksArr[i] = marksVec[i];
            }

            std::string errorMsg;
            if (!manager.addStudent(id, name, marksArr, errorMsg)) {
                json err;
                err["error"] = errorMsg;
                res.status = 409; // Conflict (e.g. duplicate ID)
                res.set_content(err.dump(), "application/json");
                return;
            }

            auto createdOpt = manager.getById(id);
            json successResp;
            successResp["success"] = true;
            successResp["message"] = "Student record added successfully";
            successResp["student"] = createdOpt ? createdOpt->toJson() : json::object();

            res.status = 201;
            res.set_content(successResp.dump(), "application/json");
        } catch (const json::parse_error& e) {
            json err;
            err["error"] = std::string("Malformed JSON body: ") + e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception& e) {
            json err;
            err["error"] = std::string("Internal error: ") + e.what();
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    // 6. PUT /api/students/{id}
    svr.Put(R"(/api/students/([0-9]+))", [&manager](const httplib::Request& req, httplib::Response& res) {
        try {
            int id = std::stoi(req.matches[1]);
            auto existing = manager.getById(id);
            if (!existing.has_value()) {
                json err;
                err["error"] = "Student with ID " + std::to_string(id) + " not found";
                res.status = 404;
                res.set_content(err.dump(), "application/json");
                return;
            }

            json body = json::parse(req.body);
            std::string name = existing->name;
            if (body.contains("name") && body["name"].is_string()) {
                name = body["name"].get<std::string>();
            }

            std::vector<double> marksVec;
            if (body.contains("marks") && body["marks"].is_array()) {
                for (const auto& item : body["marks"]) {
                    if (item.is_number()) {
                        marksVec.push_back(item.get<double>());
                    }
                }
            } else if (body.contains("subjectMarks") && body["subjectMarks"].is_object()) {
                for (const auto& subj : SUBJECTS) {
                    if (body["subjectMarks"].contains(subj) && body["subjectMarks"][subj].is_number()) {
                        marksVec.push_back(body["subjectMarks"][subj].get<double>());
                    }
                }
            } else {
                // If marks not specified, preserve existing marks
                for (double m : existing->marks) {
                    marksVec.push_back(m);
                }
            }

            auto [valid, validationError] = Student::validate(id, name, marksVec);
            if (!valid) {
                json err;
                err["error"] = validationError;
                res.status = 400;
                res.set_content(err.dump(), "application/json");
                return;
            }

            std::array<double, SUBJECT_COUNT> marksArr;
            for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
                marksArr[i] = marksVec[i];
            }

            std::string errorMsg;
            if (!manager.updateStudent(id, name, marksArr, errorMsg)) {
                json err;
                err["error"] = errorMsg;
                res.status = 404;
                res.set_content(err.dump(), "application/json");
                return;
            }

            auto updatedOpt = manager.getById(id);
            json successResp;
            successResp["success"] = true;
            successResp["message"] = "Student record updated successfully";
            successResp["student"] = updatedOpt ? updatedOpt->toJson() : json::object();

            res.status = 200;
            res.set_content(successResp.dump(), "application/json");
        } catch (const json::parse_error& e) {
            json err;
            err["error"] = std::string("Malformed JSON body: ") + e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        } catch (const std::exception& e) {
            json err;
            err["error"] = std::string("Internal error: ") + e.what();
            res.status = 500;
            res.set_content(err.dump(), "application/json");
        }
    });

    // 7. DELETE /api/students/{id}
    svr.Delete(R"(/api/students/([0-9]+))", [&manager](const httplib::Request& req, httplib::Response& res) {
        try {
            int id = std::stoi(req.matches[1]);
            std::string errorMsg;
            if (!manager.deleteStudent(id, errorMsg)) {
                json err;
                err["error"] = errorMsg;
                res.status = 404;
                res.set_content(err.dump(), "application/json");
                return;
            }

            json successResp;
            successResp["success"] = true;
            successResp["message"] = "Student record with ID " + std::to_string(id) + " deleted successfully";
            res.status = 200;
            res.set_content(successResp.dump(), "application/json");
        } catch (const std::exception& e) {
            json err;
            err["error"] = std::string("Invalid request: ") + e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        }
    });

    // 8. GET /api/rankings
    svr.Get("/api/rankings", [&manager](const httplib::Request&, httplib::Response& res) {
        auto ranked = manager.getRankings();
        json j = ranked;
        res.status = 200;
        res.set_content(j.dump(), "application/json");
    });

    // 9. GET /api/students/{id}/improvement-report
    svr.Get(R"(/api/students/([0-9]+)/improvement-report)", [&manager](const httplib::Request& req, httplib::Response& res) {
        try {
            int id = std::stoi(req.matches[1]);
            auto report = manager.getImprovementReport(id);
            if (report.is_null()) {
                json err;
                err["error"] = "Student with ID " + std::to_string(id) + " not found";
                res.status = 404;
                res.set_content(err.dump(), "application/json");
                return;
            }

            res.status = 200;
            res.set_content(report.dump(), "application/json");
        } catch (const std::exception& e) {
            json err;
            err["error"] = std::string("Invalid request: ") + e.what();
            res.status = 400;
            res.set_content(err.dump(), "application/json");
        }
    });

    // 10. GET /api/stats (Class Dashboard Statistics)
    svr.Get("/api/stats", [&manager](const httplib::Request&, httplib::Response& res) {
        json stats = manager.getDashboardStats();
        res.status = 200;
        res.set_content(stats.dump(), "application/json");
    });

    // Catch-all 404
    svr.set_error_handler([](const httplib::Request& req, httplib::Response& res) {
        if (res.status == 404) {
            json err;
            err["error"] = "Endpoint not found: " + req.path;
            res.set_content(err.dump(), "application/json");
        }
    });

    std::cout << "[C++ Backend] Server listening on http://0.0.0.0:" << port << std::endl;
    svr.listen("0.0.0.0", port);

    return 0;
}
