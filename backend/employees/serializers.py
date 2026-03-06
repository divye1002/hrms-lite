from rest_framework import serializers
from .models import Employee, Attendance


class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["employee_id", "full_name", "email", "department", "created_at"]
        read_only_fields = ["created_at"]

    def validate_employee_id(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Employee ID is required.")
        return value.strip()

    def validate_full_name(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Full name is required.")
        return value.strip()

    def validate_email(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Email address is required.")
        return value.strip().lower()

    def validate_department(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Department is required.")
        return value.strip()


class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(
        source="employee.full_name", read_only=True
    )

    class Meta:
        model = Attendance
        fields = ["id", "employee", "employee_name", "date", "status"]

    def validate(self, data):
        employee = data.get("employee")
        date = data.get("date")

        # Check for duplicate attendance
        if employee and date:
            existing = Attendance.objects.filter(employee=employee, date=date)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError(
                    {"detail": f"Attendance already marked for {employee.employee_id} on {date}."}
                )

        return data
