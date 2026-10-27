# Smart Student Performance & Academic Tracker — C++17 Backend

High-performance, lightweight C++17 REST API server for student academic records, marks management, grade determination, rankings, and subject improvement reports.

## Architecture

- **Language Standard**: C++17 (`std::array`, `std::optional`, structured bindings, `std::string_view`)
- **HTTP Server**: `cpp-httplib` (embedded header-only REST framework)
- **JSON Serialization**: `nlohmann/json` (v3.11.3 single-header)
- **Storage / Persistence**: Atomic JSON file persistence (`backend/data/students.json`)
- **Concurrency**: Thread-safe memory state protected with `std::mutex` and RAII `std::lock_guard`
- **Build System**: CMake 3.16+ with GCC/Clang/MSVC

## Subjects

The system tracks marks across five core curriculum subjects (0 to 100 marks each, 500 total):
1. **C Programming**
2. **C++**
3. **Mathematics**
4. **Computer Science**
5. **English**

## Grading System

| Percentage Range | Grade | Classification |
|---|---|---|
| 90% – 100% | **A+** | Outstanding Distinction |
| 80% – <90% | **A** | Excellent Overall Proficiency |
| 70% – <80% | **B** | Good Performance |
| 60% – <70% | **C** | Satisfactory |
| 50% – <60% | **D** | Passing (Mentorship Recommended) |
| < 50% | **F** | Academic Intervention Required |

## Academic Improvement Rule

Any subject mark **below 60.0** triggers an academic improvement notice with:
- Identified weak subject
- Specific mark scored
- Exact shortfall points needed to reach proficiency (60.0)
- Curated subject-specific study recommendation

## REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Backend status, engine info, uptime, and active student count |
| `GET` | `/api/subjects` | List of tracked subjects |
| `GET` | `/api/students` | Get all students (supports optional `?q=` search query) |
| `GET` | `/api/students/{id}` | Get single student record with computed rank and analytics |
| `POST` | `/api/students` | Create student (requires unique ID, non-empty name, 5 marks [0-100]) |
| `PUT` | `/api/students/{id}` | Update student marks or name |
| `DELETE` | `/api/students/{id}` | Delete student record |
| `GET` | `/api/rankings` | Students ranked descending by percentage (tie-break alphabetical) |
| `GET` | `/api/students/{id}/improvement-report` | Detailed weak subjects report with recommendations |
| `GET` | `/api/stats` | Class aggregate analytics, grade distributions, and subject averages |

### Example Request Payloads

#### Create / Update Student:
```json
{
  "id": 109,
  "name": "Devansh Singhania",
  "marks": [88.5, 92.0, 78.0, 85.0, 90.0]
}
```
Or with subject name map:
```json
{
  "id": 109,
  "name": "Devansh Singhania",
  "subjectMarks": {
    "C Programming": 88.5,
    "C++": 92.0,
    "Mathematics": 78.0,
    "Computer Science": 85.0,
    "English": 90.0
  }
}
```

## Compilation and Execution

### Build with CMake:
```bash
cd backend
mkdir -p build && cd build
cmake ..
cmake --build . -j$(nproc)
```

### Run Server:
```bash
# Default runs on port 8080 with data in backend/data/students.json
./backend/build/student_tracker_api 8080 backend/data/students.json
```
