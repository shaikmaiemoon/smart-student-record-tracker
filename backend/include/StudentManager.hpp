#pragma once

#include "Student.hpp"
#include <vector>
#include <string>
#include <mutex>
#include <fstream>
#include <iostream>
#include <algorithm>
#include <optional>
#include <map>
#include <numeric>

namespace tracker {

class StudentManager {
private:
    mutable std::mutex mutex_;
    std::string filePath_;
    std::vector<Student> students_;

public:
    explicit StudentManager(std::string filePath = "backend/data/students.json")
        : filePath_(std::move(filePath)) {
        if (!loadFromFile() || students_.empty()) {
            seedDefaultIfEmpty();
            saveToFile();
        }
    }

    bool loadFromFile() {
        std::lock_guard<std::mutex> lock(mutex_);
        std::ifstream file(filePath_);
        if (!file.is_open()) {
            return false;
        }

        try {
            nlohmann::json j;
            file >> j;
            if (!j.is_array()) {
                return false;
            }

            students_.clear();
            for (const auto& item : j) {
                Student s;
                s.id = item.value("id", 0);
                s.name = item.value("name", "");
                if (item.contains("marks") && item["marks"].is_array() && item["marks"].size() == SUBJECT_COUNT) {
                    for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
                        s.marks[i] = item["marks"][i].get<double>();
                    }
                }
                if (s.id > 0 && !s.name.empty()) {
                    students_.push_back(s);
                }
            }
            std::cout << "[C++ Backend] Loaded " << students_.size() << " student record(s) from " << filePath_ << std::endl;
            return true;
        } catch (const std::exception& e) {
            std::cerr << "[C++ Backend] Error parsing JSON database: " << e.what() << std::endl;
            return false;
        }
    }

    bool saveToFile() const {
        std::ofstream file(filePath_);
        if (!file.is_open()) {
            std::cerr << "[C++ Backend] Error opening file for saving: " << filePath_ << std::endl;
            return false;
        }

        try {
            nlohmann::json j = nlohmann::json::array();
            for (const auto& s : students_) {
                nlohmann::json item;
                item["id"] = s.id;
                item["name"] = s.name;
                item["marks"] = s.marks;
                item["total"] = s.total();
                item["percentage"] = s.percentage();
                item["grade"] = s.grade();
                j.push_back(item);
            }
            file << j.dump(2);
            return true;
        } catch (const std::exception& e) {
            std::cerr << "[C++ Backend] Error saving JSON data: " << e.what() << std::endl;
            return false;
        }
    }

    void seedDefaultIfEmpty() {
        if (!students_.empty()) return;

        students_ = {
            Student(101, "Aarav Sharma", {92.0, 95.0, 88.0, 94.0, 89.0}),
            Student(102, "Priya Patel",  {85.0, 89.0, 91.0, 87.0, 93.0}),
            Student(103, "Rohan Verma",  {78.0, 74.0, 68.0, 82.0, 79.0}),
            Student(104, "Ananya Iyer",  {95.0, 98.0, 96.0, 99.0, 92.0}),
            Student(105, "Vikram Singh", {54.0, 62.0, 48.0, 65.0, 58.0}),
            Student(106, "Neha Gupta",   {82.0, 78.0, 85.0, 80.0, 75.0}),
            Student(107, "Kavya Reddy",  {63.0, 58.0, 72.0, 68.0, 70.0}),
            Student(108, "Rahul Nair",   {45.0, 52.0, 50.0, 48.0, 55.0})
        };
        std::cout << "[C++ Backend] Seeded initial " << students_.size() << " student records." << std::endl;
    }

    std::vector<nlohmann::json> getAllStudents(const std::string& query = "") const {
        std::lock_guard<std::mutex> lock(mutex_);
        
        // Compute rankings first to provide rank in each student object
        std::vector<Student> sorted = students_;
        std::sort(sorted.begin(), sorted.end(), [](const Student& a, const Student& b) {
            if (std::abs(a.percentage() - b.percentage()) < 0.001) {
                return a.name < b.name;
            }
            return a.percentage() > b.percentage();
        });

        std::map<int, int> rankMap;
        for (size_t i = 0; i < sorted.size(); ++i) {
            rankMap[sorted[i].id] = static_cast<int>(i + 1);
        }

        std::string lowerQuery = query;
        std::transform(lowerQuery.begin(), lowerQuery.end(), lowerQuery.begin(), ::tolower);

        std::vector<nlohmann::json> result;
        for (const auto& s : students_) {
            if (!lowerQuery.empty()) {
                std::string sName = s.name;
                std::transform(sName.begin(), sName.end(), sName.begin(), ::tolower);
                std::string idStr = std::to_string(s.id);
                if (sName.find(lowerQuery) == std::string::npos && idStr.find(lowerQuery) == std::string::npos) {
                    continue;
                }
            }
            int rank = rankMap.count(s.id) ? rankMap[s.id] : 0;
            result.push_back(s.toJson(rank));
        }
        return result;
    }

    std::optional<Student> getById(int id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        for (const auto& s : students_) {
            if (s.id == id) {
                return s;
            }
        }
        return std::nullopt;
    }

    bool idExistsNoLock(int id) const {
        for (const auto& s : students_) {
            if (s.id == id) return true;
        }
        return false;
    }

    bool addStudent(int id, const std::string& name, const std::array<double, SUBJECT_COUNT>& marks, std::string& errorMsg) {
        std::lock_guard<std::mutex> lock(mutex_);
        if (idExistsNoLock(id)) {
            errorMsg = "Student with ID " + std::to_string(id) + " already exists. Please choose a unique ID.";
            return false;
        }

        Student s(id, name, marks);
        students_.push_back(s);
        saveToFile();
        return true;
    }

    bool updateStudent(int id, const std::string& name, const std::array<double, SUBJECT_COUNT>& marks, std::string& errorMsg) {
        std::lock_guard<std::mutex> lock(mutex_);
        for (auto& s : students_) {
            if (s.id == id) {
                if (!name.empty()) {
                    s.name = name;
                }
                s.marks = marks;
                saveToFile();
                return true;
            }
        }
        errorMsg = "Student with ID " + std::to_string(id) + " not found.";
        return false;
    }

    bool deleteStudent(int id, std::string& errorMsg) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(students_.begin(), students_.end(), [id](const Student& s) {
            return s.id == id;
        });

        if (it == students_.end()) {
            errorMsg = "Student with ID " + std::to_string(id) + " was not found.";
            return false;
        }

        students_.erase(it);
        saveToFile();
        return true;
    }

    std::vector<nlohmann::json> getRankings() const {
        std::lock_guard<std::mutex> lock(mutex_);
        std::vector<Student> ranked = students_;

        // Sort descending by percentage, tie breaker ascending by name
        std::sort(ranked.begin(), ranked.end(), [](const Student& a, const Student& b) {
            if (std::abs(a.percentage() - b.percentage()) < 0.001) {
                return a.name < b.name;
            }
            return a.percentage() > b.percentage();
        });

        std::vector<nlohmann::json> result;
        for (size_t i = 0; i < ranked.size(); ++i) {
            result.push_back(ranked[i].toJson(static_cast<int>(i + 1)));
        }
        return result;
    }

    nlohmann::json getImprovementReport(int id) const {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it = std::find_if(students_.begin(), students_.end(), [id](const Student& s) {
            return s.id == id;
        });

        if (it == students_.end()) {
            return nullptr;
        }

        const Student& s = *it;
        auto weakList = s.getWeakSubjects();

        nlohmann::json report;
        report["studentId"] = s.id;
        report["studentName"] = s.name;
        report["totalMarks"] = s.total();
        report["percentage"] = s.percentage();
        report["grade"] = s.grade();
        report["needsImprovement"] = !weakList.empty();
        report["weakSubjectsCount"] = weakList.size();

        nlohmann::json weakJson = nlohmann::json::array();
        for (const auto& w : weakList) {
            nlohmann::json item;
            item["subject"] = w.subject;
            item["mark"] = w.mark;
            item["maxMark"] = 100;
            item["threshold"] = 60.0;
            item["shortfall"] = w.shortfall;
            item["recommendation"] = w.recommendation;
            weakJson.push_back(item);
        }
        report["weakSubjects"] = weakJson;

        nlohmann::json strongJson = nlohmann::json::array();
        for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
            if (s.marks[i] >= 60.0) {
                nlohmann::json item;
                item["subject"] = SUBJECTS[i];
                item["mark"] = s.marks[i];
                strongJson.push_back(item);
            }
        }
        report["proficientSubjects"] = strongJson;

        if (weakList.empty()) {
            report["summary"] = "No subjects below 60. Keep up the good work!";
        } else {
            std::ostringstream ss;
            ss << "Needs improvement in " << weakList.size() << " subject(s): ";
            for (size_t i = 0; i < weakList.size(); ++i) {
                ss << weakList[i].subject << " (" << std::fixed << std::setprecision(1) << weakList[i].mark << "/100)";
                if (i + 1 < weakList.size()) ss << ", ";
            }
            report["summary"] = ss.str();
        }

        return report;
    }

    nlohmann::json getDashboardStats() const {
        std::lock_guard<std::mutex> lock(mutex_);
        nlohmann::json stats;

        size_t count = students_.size();
        stats["totalStudents"] = count;

        if (count == 0) {
            stats["averagePercentage"] = 0.0;
            stats["highestPercentage"] = 0.0;
            stats["lowestPercentage"] = 0.0;
            stats["topPerformer"] = nullptr;
            stats["gradeDistribution"] = {
                {"S", 0}, {"A", 0}, {"B", 0}, {"C", 0}, {"D", 0}, {"F", 0}
            };
            stats["subjectAverages"] = nlohmann::json::array();
            stats["needsImprovementCount"] = 0;
            return stats;
        }

        double totalPercents = 0.0;
        double maxPerc = -1.0;
        double minPerc = 101.0;
        std::string topName = "";
        int topId = 0;
        int improvementCount = 0;

        std::map<std::string, int> grades = {
            {"S", 0}, {"A", 0}, {"B", 0}, {"C", 0}, {"D", 0}, {"F", 0}
        };

        std::array<double, SUBJECT_COUNT> subjectSums = {0, 0, 0, 0, 0};
        std::array<double, SUBJECT_COUNT> subjectMins = {100, 100, 100, 100, 100};
        std::array<double, SUBJECT_COUNT> subjectMaxs = {0, 0, 0, 0, 0};
        std::array<int, SUBJECT_COUNT> subjectWeakCount = {0, 0, 0, 0, 0};

        for (const auto& s : students_) {
            double p = s.percentage();
            totalPercents += p;
            if (p > maxPerc) {
                maxPerc = p;
                topName = s.name;
                topId = s.id;
            }
            if (p < minPerc) {
                minPerc = p;
            }

            grades[s.grade()]++;

            if (s.hasSubjectBelow60()) {
                improvementCount++;
            }

            for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
                double m = s.marks[i];
                subjectSums[i] += m;
                if (m < subjectMins[i]) subjectMins[i] = m;
                if (m > subjectMaxs[i]) subjectMaxs[i] = m;
                if (m < 60.0) subjectWeakCount[i]++;
            }
        }

        stats["averagePercentage"] = std::round((totalPercents / count) * 100.0) / 100.0;
        stats["highestPercentage"] = maxPerc;
        stats["lowestPercentage"] = minPerc;
        stats["needsImprovementCount"] = improvementCount;
        stats["proficientCount"] = count - improvementCount;

        nlohmann::json topObj;
        topObj["id"] = topId;
        topObj["name"] = topName;
        topObj["percentage"] = maxPerc;
        stats["topPerformer"] = topObj;

        stats["gradeDistribution"] = grades;

        nlohmann::json subjArray = nlohmann::json::array();
        for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
            nlohmann::json sInfo;
            sInfo["subject"] = SUBJECTS[i];
            sInfo["average"] = std::round((subjectSums[i] / count) * 100.0) / 100.0;
            sInfo["min"] = subjectMins[i];
            sInfo["max"] = subjectMaxs[i];
            sInfo["studentsBelow60"] = subjectWeakCount[i];
            subjArray.push_back(sInfo);
        }
        stats["subjectAverages"] = subjArray;

        return stats;
    }
};

} // namespace tracker
