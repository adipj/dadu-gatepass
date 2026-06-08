import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRole } from '../utils/api';
import StudentFacultyView from '../components/StudentFacultyView';
import ApproverView from '../components/ApproverView';
import GateSecurityView from '../components/GateSecurityView';

export default function Dashboard() {
    const navigate = useNavigate();
    const role = getRole();

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/');
    }, [navigate]);

    if (role === 'STUDENT' || role === 'FACULTY') return <StudentFacultyView role={role} />;
    if (['HOSTEL_SUPERINTENDENT', 'CONFERENCE_SUPERVISOR', 'ADMIN'].includes(role)) return <ApproverView role={role} />;
    if (role === 'GATE_SECURITY') return <GateSecurityView />;

    return <p>Unauthorized or Unknown Role</p>;
}