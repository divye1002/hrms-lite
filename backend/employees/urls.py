from django.urls import path
from . import views

urlpatterns = [
    path("employees/", views.employee_list_create, name="employee-list-create"),
    path("employees/<str:employee_id>/", views.employee_delete, name="employee-delete"),
    path("attendance/", views.attendance_list_create, name="attendance-list-create"),
    path("dashboard/", views.dashboard, name="dashboard"),
]
