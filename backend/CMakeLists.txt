cmake_minimum_required(VERSION 3.16)
project(student_performance_tracker_backend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Optimization flags
if(MSVC)
    add_compile_options(/W4 /EHsc)
else()
    add_compile_options(-Wall -Wextra -O2)
endif()

find_package(Threads REQUIRED)

include_directories(
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

add_executable(student_tracker_api
    main.cpp
)

target_link_libraries(student_tracker_api
    PRIVATE
        Threads::Threads
)

# Output build info
message(STATUS "Configured Student Performance Tracker C++ Backend")
message(STATUS "C++ Standard: ${CMAKE_CXX_STANDARD}")
