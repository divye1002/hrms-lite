from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Employee, Attendance


class EmployeeAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.valid_employee = {
            "employee_id": "EMP001",
            "full_name": "John Doe",
            "email": "john@example.com",
            "department": "Engineering",
        }

    def test_create_employee_success(self):
        response = self.client.post("/api/employees/", self.valid_employee, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["employee_id"], "EMP001")

    def test_create_employee_missing_fields(self):
        response = self.client.post("/api/employees/", {"employee_id": "EMP002"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_duplicate_employee_id(self):
        self.client.post("/api/employees/", self.valid_employee, format="json")
        dup = {**self.valid_employee, "email": "other@example.com"}
        response = self.client.post("/api/employees/", dup, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_duplicate_email(self):
        self.client.post("/api/employees/", self.valid_employee, format="json")
        dup = {**self.valid_employee, "employee_id": "EMP099"}
        response = self.client.post("/api/employees/", dup, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_employees(self):
        self.client.post("/api/employees/", self.valid_employee, format="json")
        response = self.client.get("/api/employees/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_delete_employee(self):
        self.client.post("/api/employees/", self.valid_employee, format="json")
        response = self.client.delete("/api/employees/EMP001/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Employee.objects.count(), 0)

    def test_delete_nonexistent_employee(self):
        response = self.client.delete("/api/employees/NOPE/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class AttendanceAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.employee = Employee.objects.create(
            employee_id="EMP001",
            full_name="Jane Doe",
            email="jane@example.com",
            department="Design",
        )

    def test_mark_attendance_success(self):
        data = {"employee": "EMP001", "date": "2025-01-15", "status": "Present"}
        response = self.client.post("/api/attendance/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_mark_duplicate_attendance(self):
        data = {"employee": "EMP001", "date": "2025-01-15", "status": "Present"}
        self.client.post("/api/attendance/", data, format="json")
        response = self.client.post("/api/attendance/", data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_attendance(self):
        Attendance.objects.create(employee=self.employee, date="2025-01-15", status="Present")
        response = self.client.get("/api/attendance/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_filter_by_employee(self):
        Attendance.objects.create(employee=self.employee, date="2025-01-15", status="Present")
        response = self.client.get("/api/attendance/?employee_id=EMP001")
        self.assertEqual(len(response.data), 1)
        response = self.client.get("/api/attendance/?employee_id=EMP999")
        self.assertEqual(len(response.data), 0)

    def test_filter_by_date(self):
        Attendance.objects.create(employee=self.employee, date="2025-01-15", status="Present")
        response = self.client.get("/api/attendance/?date=2025-01-15")
        self.assertEqual(len(response.data), 1)
        response = self.client.get("/api/attendance/?date=2025-12-25")
        self.assertEqual(len(response.data), 0)


class DashboardAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_dashboard_empty(self):
        response = self.client.get("/api/dashboard/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["total_employees"], 0)

    def test_dashboard_with_data(self):
        emp = Employee.objects.create(
            employee_id="EMP001",
            full_name="Test User",
            email="test@example.com",
            department="HR",
        )
        response = self.client.get("/api/dashboard/")
        self.assertEqual(response.data["total_employees"], 1)
        self.assertEqual(len(response.data["employee_stats"]), 1)
