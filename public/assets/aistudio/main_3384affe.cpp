#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <iomanip>
#include <algorithm>
#include <limits>

using namespace std;

class Student {
public:
    int id{};
    string name;
    double marks[5]{};

    double total() const {
        double sum = 0;
        for (double mark : marks) sum += mark;
        return sum;
    }

    double percentage() const {
        return total() / 5.0; // Each subject is out of 100
    }

    string grade() const {
        double p = percentage();
        if (p >= 90) return "A+";
        if (p >= 80) return "A";
        if (p >= 70) return "B";
        if (p >= 60) return "C";
        if (p >= 50) return "D";
        return "F";
    }
};

const string DATA_FILE = "students.txt";
const string SUBJECTS[5] = {"C Programming", "C++", "Mathematics", "Computer Science", "English"};

void clearInput() {
    cin.clear();
    cin.ignore(numeric_limits<streamsize>::max(), '\n');
}

int readInt(const string& prompt) {
    int value;
    while (true) {
        cout << prompt;
        if (cin >> value) {
            clearInput();
            return value;
        }
        cout << "Invalid input. Please enter a whole number.\n";
        clearInput();
    }
}

double readMark(const string& prompt) {
    double value;
    while (true) {
        cout << prompt;
        if (cin >> value && value >= 0 && value <= 100) {
            clearInput();
            return value;
        }
        cout << "Invalid mark. Enter a value from 0 to 100.\n";
        clearInput();
    }
}

void saveStudents(const vector<Student>& students) {
    ofstream file(DATA_FILE);
    if (!file) {
        cout << "Error: Could not save student data.\n";
        return;
    }

    for (const Student& s : students) {
        file << s.id << '\n' << s.name << '\n';
        for (double mark : s.marks) file << mark << '\n';
    }
    cout << "Student records saved successfully.\n";
}

void loadStudents(vector<Student>& students) {
    ifstream file(DATA_FILE);
    if (!file) return;

    Student s;
    while (file >> s.id) {
        file.ignore(numeric_limits<streamsize>::max(), '\n');
        if (!getline(file, s.name)) break;

        bool complete = true;
        for (double& mark : s.marks) {
            if (!(file >> mark)) {
                complete = false;
                break;
            }
        }
        file.ignore(numeric_limits<streamsize>::max(), '\n');
        if (complete) students.push_back(s);
    }
}

bool idExists(const vector<Student>& students, int id) {
    for (const Student& s : students) {
        if (s.id == id) return true;
    }
    return false;
}

void addStudent(vector<Student>& students) {
    Student s;
    s.id = readInt("Enter student ID: ");
    if (idExists(students, s.id)) {
        cout << "That ID already exists. Use a unique ID.\n";
        return;
    }

    cout << "Enter student name: ";
    getline(cin, s.name);
    if (s.name.empty()) {
        cout << "Name cannot be empty.\n";
        return;
    }

    for (int i = 0; i < 5; ++i) {
        s.marks[i] = readMark("Enter marks in " + string(SUBJECTS[i]) + " (0-100): ");
    }

    students.push_back(s);
    saveStudents(students);
    cout << "Student added successfully. Grade: " << s.grade() << "\n";
}

void displayStudent(const Student& s) {
    cout << "\nID: " << s.id << "\nName: " << s.name << "\n";
    cout << fixed << setprecision(2);
    for (int i = 0; i < 5; ++i) {
        cout << "  " << SUBJECTS[i] << ": " << s.marks[i] << "/100\n";
    }
    cout << "Total: " << s.total() << "/500\n";
    cout << "Percentage: " << s.percentage() << "%\n";
    cout << "Grade: " << s.grade() << "\n";
}

void displayAll(const vector<Student>& students) {
    if (students.empty()) {
        cout << "No student records found. Add a student first.\n";
        return;
    }

    cout << "\n" << left << setw(8) << "ID" << setw(24) << "Name"
         << right << setw(10) << "Total" << setw(13) << "Percent" << setw(8) << "Grade" << "\n";
    cout << string(63, '-') << "\n";
    for (const Student& s : students) {
        cout << left << setw(8) << s.id << setw(24) << s.name
             << right << setw(10) << fixed << setprecision(2) << s.total()
             << setw(12) << s.percentage() << "%" << setw(8) << s.grade() << "\n";
    }
}

void searchStudent(const vector<Student>& students) {
    int id = readInt("Enter student ID to search: ");
    for (const Student& s : students) {
        if (s.id == id) {
            displayStudent(s);
            return;
        }
    }
    cout << "Student with ID " << id << " was not found.\n";
}

void updateMarks(vector<Student>& students) {
    int id = readInt("Enter student ID to update: ");
    for (Student& s : students) {
        if (s.id == id) {
            cout << "Updating marks for " << s.name << ":\n";
            for (int i = 0; i < 5; ++i) {
                s.marks[i] = readMark("Enter new marks in " + string(SUBJECTS[i]) + " (0-100): ");
            }
            saveStudents(students);
            cout << "Marks updated successfully.\n";
            return;
        }
    }
    cout << "Student not found.\n";
}

void deleteStudent(vector<Student>& students) {
    int id = readInt("Enter student ID to delete: ");
    auto it = find_if(students.begin(), students.end(),
                      [id](const Student& s) { return s.id == id; });
    if (it == students.end()) {
        cout << "Student not found.\n";
        return;
    }
    students.erase(it);
    saveStudents(students);
    cout << "Student record deleted.\n";
}

void showRankings(const vector<Student>& students) {
    if (students.empty()) {
        cout << "No records available for ranking.\n";
        return;
    }
    vector<Student> ranked = students;
    sort(ranked.begin(), ranked.end(), [](const Student& a, const Student& b) {
        if (a.percentage() == b.percentage()) return a.name < b.name;
        return a.percentage() > b.percentage();
    });

    cout << "\nSTUDENT RANKINGS\n";
    cout << left << setw(8) << "Rank" << setw(8) << "ID" << setw(24) << "Name"
         << right << setw(12) << "Percent" << setw(8) << "Grade" << "\n";
    cout << string(60, '-') << "\n";
    for (size_t i = 0; i < ranked.size(); ++i) {
        const Student& s = ranked[i];
        cout << left << setw(8) << (i + 1) << setw(8) << s.id << setw(24) << s.name
             << right << setw(11) << fixed << setprecision(2) << s.percentage() << "%"
             << setw(8) << s.grade() << "\n";
    }
}

void showWeakSubjects(const vector<Student>& students) {
    int id = readInt("Enter student ID for subject analysis: ");
    for (const Student& s : students) {
        if (s.id == id) {
            cout << "\nSubject analysis for " << s.name << ":\n";
            bool found = false;
            for (int i = 0; i < 5; ++i) {
                if (s.marks[i] < 60) {
                    cout << "- Needs improvement in " << SUBJECTS[i]
                         << " (" << s.marks[i] << "/100)\n";
                    found = true;
                }
            }
            if (!found) cout << "No subjects below 60. Keep up the good work!\n";
            return;
        }
    }
    cout << "Student not found.\n";
}

void showMenu() {
    cout << "\n============================================\n";
    cout << "  SMART STUDENT PERFORMANCE TRACKER\n";
    cout << "============================================\n";
    cout << "1. Add student\n";
    cout << "2. Display all students\n";
    cout << "3. Search student by ID\n";
    cout << "4. Update student marks\n";
    cout << "5. Delete student record\n";
    cout << "6. Show student rankings\n";
    cout << "7. Subject improvement report\n";
    cout << "8. Save records\n";
    cout << "0. Exit\n";
}

int main() {
    vector<Student> students;
    loadStudents(students);

    cout << "Welcome! Loaded " << students.size() << " saved student record(s).\n";
    while (true) {
        showMenu();
        int choice = readInt("Choose an option: ");

        switch (choice) {
            case 1: addStudent(students); break;
            case 2: displayAll(students); break;
            case 3: searchStudent(students); break;
            case 4: updateMarks(students); break;
            case 5: deleteStudent(students); break;
            case 6: showRankings(students); break;
            case 7: showWeakSubjects(students); break;
            case 8: saveStudents(students); break;
            case 0:
                saveStudents(students);
                cout << "Thank you for using Smart Student Performance Tracker!\n";
                return 0;
            default:
                cout << "Invalid option. Please choose from the menu.\n";
        }
    }
}
