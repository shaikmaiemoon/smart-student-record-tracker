#pragma once

#include <string>
#include <vector>
#include <array>
#include <iomanip>
#include <sstream>
#include <cmath>
#include <algorithm>
#include "json.hpp"

namespace tracker {

constexpr size_t SUBJECT_COUNT = 5;

inline const std::array<std::string, SUBJECT_COUNT> SUBJECTS = {
    "C Programming",
    "C++",
    "Mathematics",
    "Computer Science",
    "English"
};

struct WeakSubjectInfo {
    std::string subject;
    int index;
    double mark;
    double shortfall;
    std::string recommendation;
};

class Student {
public:
    int id{0};
    std::string name;
    std::array<double, SUBJECT_COUNT> marks{0.0, 0.0, 0.0, 0.0, 0.0};

    Student() = default;

    Student(int id, std::string name, const std::array<double, SUBJECT_COUNT>& marks)
        : id(id), name(std::move(name)), marks(marks) {}

    double total() const {
        double sum = 0.0;
        for (double m : marks) {
            sum += m;
        }
        return std::round(sum * 100.0) / 100.0;
    }

    double percentage() const {
        return std::round((total() / static_cast<double>(SUBJECT_COUNT)) * 100.0) / 100.0;
    }

    std::string grade() const {
        double p = percentage();
        if (p >= 90.0) return "S";
        if (p >= 80.0) return "A";
        if (p >= 70.0) return "B";
        if (p >= 60.0) return "C";
        if (p >= 50.0) return "D";
        return "F";
    }

    std::string performanceRemark() const {
        std::string g = grade();
        if (g == "S") return "Outstanding Academic Distinction (S Grade)";
        if (g == "A") return "Excellent Overall Proficiency";
        if (g == "B") return "Good Performance with Solid Foundations";
        if (g == "C") return "Satisfactory, Scope for Focus";
        if (g == "D") return "Passing, Academic Mentorship Needed";
        return "Critical Attention Required";
    }

    bool hasSubjectBelow60() const {
        for (double m : marks) {
            if (m < 60.0) return true;
        }
        return false;
    }

    std::vector<WeakSubjectInfo> getWeakSubjects() const {
        std::vector<WeakSubjectInfo> weak;
        for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
            if (marks[i] < 60.0) {
                std::string rec;
                if (SUBJECTS[i] == "C Programming") {
                    rec = "Focus on pointers, memory management, and structured debugging in C.";
                } else if (SUBJECTS[i] == "C++") {
                    rec = "Practice object-oriented principles, STL containers, and modern C++ memory safety.";
                } else if (SUBJECTS[i] == "Mathematics") {
                    rec = "Review discrete math, calculus fundamentals, and step-by-step problem derivations.";
                } else if (SUBJECTS[i] == "Computer Science") {
                    rec = "Reinforce core data structures, complexity analysis, and operating system basics.";
                } else if (SUBJECTS[i] == "English") {
                    rec = "Enhance technical writing, grammar precision, and presentation communication.";
                } else {
                    rec = "Review core concepts and solve revision problem sets.";
                }

                weak.push_back({
                    SUBJECTS[i],
                    static_cast<int>(i),
                    marks[i],
                    std::round((60.0 - marks[i]) * 100.0) / 100.0,
                    rec
                });
            }
        }
        return weak;
    }

    nlohmann::json toJson(int rank = 0) const {
        nlohmann::json j;
        j["id"] = id;
        j["name"] = name;
        j["marks"] = marks;
        
        nlohmann::json subjectMarks = nlohmann::json::object();
        for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
            subjectMarks[SUBJECTS[i]] = marks[i];
        }
        j["subjectMarks"] = subjectMarks;

        j["total"] = total();
        j["maxTotal"] = 500;
        j["percentage"] = percentage();
        j["grade"] = grade();
        j["performanceRemark"] = performanceRemark();
        j["needsImprovement"] = hasSubjectBelow60();
        
        auto weak = getWeakSubjects();
        j["weakSubjectsCount"] = weak.size();
        
        if (rank > 0) {
            j["rank"] = rank;
        }

        return j;
    }

    static std::pair<bool, std::string> validate(int id, const std::string& name, const std::vector<double>& marksVec) {
        if (id <= 0) {
            return {false, "Student ID must be a positive integer greater than 0."};
        }
        
        // Trim check for empty name
        std::string trimmed = name;
        trimmed.erase(trimmed.begin(), std::find_if(trimmed.begin(), trimmed.end(), [](unsigned char ch) {
            return !std::isspace(ch);
        }));
        trimmed.erase(std::find_if(trimmed.rbegin(), trimmed.rend(), [](unsigned char ch) {
            return !std::isspace(ch);
        }).base(), trimmed.end());

        if (trimmed.empty()) {
            return {false, "Student name cannot be empty or whitespace only."};
        }

        if (trimmed.length() > 100) {
            return {false, "Student name exceeds maximum permitted length of 100 characters."};
        }

        if (marksVec.size() != SUBJECT_COUNT) {
            return {false, "Exactly 5 subject marks must be provided (C Programming, C++, Mathematics, Computer Science, English)."};
        }

        for (size_t i = 0; i < SUBJECT_COUNT; ++i) {
            double m = marksVec[i];
            if (std::isnan(m) || std::isinf(m) || m < 0.0 || m > 100.0) {
                return {false, "Mark for '" + SUBJECTS[i] + "' must be a valid number between 0 and 100."};
            }
        }

        return {true, ""};
    }
};

} // namespace tracker
