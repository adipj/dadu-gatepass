import { useEffect, useState } from 'react';
import { getRole, clearAuth } from '../utils/api';
import { StudentDashboard } from './dashboards/StudentDashboard';
import { FacultyDashboard } from './dashboards/FacultyDashboard';
import { ApproverDashboard } from './dashboards/ApproverDashboard';
import { GateSecurityDashboard } from './dashboards/GateSecurityDashboard';

export function DashboardLoader() {
    const role = getRole();

    if (!role) {
        clearAuth();
        return null;
    }

    const renderDashboard = () => {
        switch (role) {
            case 'STUDENT': return <StudentDashboard />;
            case 'FACULTY': return <FacultyDashboard />;
            case 'HOSTEL_SUPERINTENDENT':
            case 'CONFERENCE_SUPERVISOR':
            case 'ADMIN': return <ApproverDashboard role={role} />;
            case 'GATE_SECURITY': return <GateSecurityDashboard />;
            default: return <div>Unknown Role</div>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{role} Dashboard</h1>
                <button onClick={clearAuth} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
            </div>
            {renderDashboard()}
        </div>
    );
}