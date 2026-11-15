# LogMyDay – Employee Attendance Management System

A web-based Employee Attendance Management System built using Java, Spring Boot, Spring Security, and Oracle Database.

LogMyDay helps administrators manage employees, monitor attendance, and assign work projects. Employees can securely log in, record their attendance, view attendance history, and manage their assigned projects.

## Features

### Admin Module
- Admin authentication and logout.
- Dashboard with employee and attendance statistics.
- Add, update, search, and deactivate employees.
- Search employees by ID or name.
- View and filter employee attendance records.
- Manage attendance correction and removal requests.
- Create, update, and manage work projects.
- Assign and reassign projects to employees.
- Monitor project status.

### Employee Module
- Employee login using Employee ID and password.
- Check-in and check-out using system time.
- View personal attendance records.
- View attendance history for the last 7 days.
- Submit attendance correction and removal requests.
- View assigned work projects.
- View personal profile.

## Technologies Used

| Technology | Purpose |
|---|---|
| Java 26 | Backend programming |
| Spring Boot 4.1.2 | Backend framework |
| Spring Security 7.1.2 | Authentication and security |
| Spring Data JPA | Database operations |
| Hibernate | ORM |
| Oracle Database | Data storage |
| HTML5 | Frontend structure |
| CSS3 | User interface styling |
| JavaScript | Frontend functionality |
| Maven | Project and dependency management |
| IntelliJ IDEA | Development environment |

## Database

LogMyDay uses Oracle Database with the following main tables:

- EMPLOYEES
- ATTENDANCE
- ATTENDANCE_REQUESTS
- WORK_PROJECTS

The application connects to the Oracle database using environment variables for database credentials.

## Project Structure

```text
LogMyDay/
│
├── src/
│   ├── main/
│   │   ├── java/com/logmyday/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── repository/
│   │   │   └── service/
│   │   │
│   │   └── resources/
│   │       ├── static/
│   │       └── templates/
│   │
│   └── test/
│
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

## Installation and Setup

### Prerequisites

- Java JDK 26
- IntelliJ IDEA
- Oracle Database
- Maven

### Steps

1. Clone the repository:

```bash
git clone https://github.com/Aman-Kumar2920/LogMyDay.git
```

2. Open the project in IntelliJ IDEA.

3. Configure the Oracle database connection.

4. Set the required environment variables:

```text
DB_USERNAME=LOGMYDAY
DB_PASSWORD=your_oracle_password
```

5. Configure the admin credentials required by the application.

6. Run the Spring Boot application from IntelliJ IDEA.

7. Open the application in your browser:

```text
http://localhost:8080
```

## Security

- Passwords are stored using BCrypt hashing.
- Admin and employee authentication use separate session attributes.
- Employees can access their own attendance records.
- Database credentials are configured through environment variables.
- Deactivated employees retain their historical attendance records.

## Future Enhancements

- Deploy the application online.
- Add advanced attendance reports.
- Improve automated testing.
- Add project progress reports and analytics.

## Developer

**Aman Kumar**

Computer Science and Engineering Student

GitHub: [Aman-Kumar2920](https://github.com/Aman-Kumar2920)

Project Repository: [LogMyDay](https://github.com/Aman-Kumar2920/LogMyDay)

---

*LogMyDay – Making Employee Attendance Management Simple and Efficient.*