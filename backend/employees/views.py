from datetime import date

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Employee, Attendance
from .serializers import EmployeeSerializer, AttendanceSerializer


# ──────────────────────────────────────────────
#  Employee endpoints
# ──────────────────────────────────────────────


@api_view(["GET", "POST"])
def employee_list_create(request):
    """GET  /api/employees/  → list all employees
    POST /api/employees/  → create a new employee"""

    if request.method == "GET":
        employees = Employee.objects.all()
        serializer = EmployeeSerializer(employees, many=True)
        return Response(serializer.data)

    # POST
    serializer = EmployeeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(
        {"errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


@api_view(["DELETE"])
def employee_delete(request, employee_id):
    """DELETE /api/employees/<employee_id>/"""
    try:
        employee = Employee.objects.get(employee_id=employee_id)
    except Employee.DoesNotExist:
        return Response(
            {"error": f"Employee '{employee_id}' not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    employee.delete()
    return Response(
        {"message": f"Employee '{employee_id}' deleted successfully."},
        status=status.HTTP_200_OK,
    )


# ──────────────────────────────────────────────
#  Attendance endpoints
# ──────────────────────────────────────────────


@api_view(["GET", "POST"])
def attendance_list_create(request):
    """GET  /api/attendance/?employee_id=&date=  → list (with optional filters)
    POST /api/attendance/                      → mark attendance"""

    if request.method == "GET":
        qs = Attendance.objects.select_related("employee").all()

        employee_id = request.query_params.get("employee_id")
        filter_date = request.query_params.get("date")

        if employee_id:
            qs = qs.filter(employee__employee_id=employee_id)
        if filter_date:
            qs = qs.filter(date=filter_date)

        serializer = AttendanceSerializer(qs, many=True)
        return Response(serializer.data)

    # POST
    serializer = AttendanceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(
        {"errors": serializer.errors},
        status=status.HTTP_400_BAD_REQUEST,
    )


# ──────────────────────────────────────────────
#  Dashboard endpoint
# ──────────────────────────────────────────────


@api_view(["GET"])
def dashboard(request):
    """GET /api/dashboard/ → summary statistics"""
    today = date.today()

    total_employees = Employee.objects.count()
    today_present = Attendance.objects.filter(date=today, status="Present").count()
    today_absent = Attendance.objects.filter(date=today, status="Absent").count()

    # Per-employee present-day counts
    employees = Employee.objects.all()
    employee_stats = []
    for emp in employees:
        present_count = Attendance.objects.filter(
            employee=emp, status="Present"
        ).count()
        total_records = Attendance.objects.filter(employee=emp).count()
        employee_stats.append(
            {
                "employee_id": emp.employee_id,
                "full_name": emp.full_name,
                "department": emp.department,
                "total_present": present_count,
                "total_records": total_records,
            }
        )

    return Response(
        {
            "total_employees": total_employees,
            "today_present": today_present,
            "today_absent": today_absent,
            "today_unmarked": total_employees - today_present - today_absent,
            "employee_stats": employee_stats,
        }
    )
