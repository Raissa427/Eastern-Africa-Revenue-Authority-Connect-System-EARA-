# EARACONNECT User Guide
## Committee Management System for East African Community (EAC)

---

**Version:** 4.0  
**Date:** January 2025  
**Author:** EARACONNECT Development Team  
**Target Audience:** EAC Committee Members, Secretaries, Chairs, and Administrators

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Requirements](#system-requirements)
3. [Installation Guide](#installation-guide)
4. [Getting Started](#getting-started)
5. [User Roles and Permissions](#user-roles-and-permissions)
6. [Login and Authentication](#login-and-authentication)
7. [Feature Usage Guide](#feature-usage-guide)
8. [Dashboard Overview](#dashboard-overview)
9. [Troubleshooting](#troubleshooting)
10. [FAQ](#faq)
11. [Support Information](#support-information)

---

## Introduction

### What is EARACONNECT?

EARACONNECT is a comprehensive committee management system designed specifically for the East African Community (EAC). It facilitates efficient management of committees, subcommittees, meetings, resolutions, and reports across all EAC member countries.

### Purpose

The system solves the following key problems:
- **Centralized Committee Management**: Streamline committee operations across multiple countries
- **Meeting Coordination**: Efficient scheduling and management of meetings
- **Resolution Tracking**: Monitor progress of resolutions and assignments
- **Performance Analytics**: Track committee performance and member participation
- **Document Management**: Centralized storage and access to committee documents

### Target Audience

This system is designed for:
- **Administrators**: System administrators managing user accounts and system configuration
- **Secretaries**: Committee secretaries managing meetings and documentation
- **Chairs**: Committee chairs overseeing subcommittee operations
- **Heads of Delegation**: Senior officials managing delegation activities
- **Committee Members**: Active participants in committee activities
- **Commissioner General**: High-level officials with oversight responsibilities

---

## System Requirements

### Hardware Requirements

**Minimum Requirements:**
- **RAM**: 4GB
- **CPU**: Dual-core processor (2.0 GHz)
- **Disk Space**: 2GB free space
- **Network**: Stable internet connection

**Recommended Requirements:**
- **RAM**: 8GB or higher
- **CPU**: Quad-core processor (2.5 GHz or higher)
- **Disk Space**: 5GB free space
- **Network**: High-speed broadband connection

### Software Requirements

**Backend (Server):**
- **Java**: Version 17 or higher
- **Maven**: Version 3.6 or higher
- **PostgreSQL**: Version 12 or higher
- **Operating System**: Windows 10/11, Linux (Ubuntu 18.04+), or macOS 10.15+

**Frontend (Client):**
- **Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
- **JavaScript**: Enabled
- **Cookies**: Enabled
- **Screen Resolution**: 1024x768 minimum (1920x1080 recommended)

---

## Installation Guide

### Backend Installation

1. **Download the Backend Package**
   - Extract `EARACONNECT-BACKEND-DEPLOY4-main.zip`
   - Navigate to the extracted folder

2. **Database Setup**
   ```bash
   # Run the database setup script
   ./setup_database.ps1
   ```

3. **Start the Backend Server**
   ```bash
   # Windows
   ./start-server.bat
   
   # Linux/Mac
   ./start-server.sh
   ```

4. **Verify Installation**
   - Open browser and navigate to `http://localhost:8080`
   - You should see the API documentation

### Frontend Installation

1. **Download the Frontend Package**
   - Extract `EARACONNECT-FRONTEND-DEPLOY4-main.zip`
   - Navigate to the extracted folder

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Frontend Application**
   ```bash
   npm start
   ```

4. **Access the Application**
   - Open browser and navigate to `http://localhost:3000`
   - The EARACONNECT login page should appear

---

## Getting Started

### First-Time Setup

1. **Access the System**
   - Open your web browser
   - Navigate to `http://localhost:3000`
   - You will see the EARACONNECT login page

2. **Default Admin Login**
   - **Email**: `admin@earaconnect.com`
   - **Password**: `admin123`
   - Click "Login"

3. **Create User Accounts**
   - After logging in as admin, navigate to "User Management"
   - Create accounts for all committee members
   - Assign appropriate roles and permissions

### Initial Configuration

1. **Set Up Countries**
   - Add all EAC member countries
   - Configure country-specific settings

2. **Create Committees**
   - Set up main committees
   - Create subcommittees as needed

3. **Assign Members**
   - Assign users to appropriate committees
   - Set up role hierarchies

---

## User Roles and Permissions

### Administrator (ADMIN)

**Responsibilities:**
- System configuration and maintenance
- User account management
- Role assignment and permissions
- System monitoring and troubleshooting

**Key Features:**
- Create, edit, and delete user accounts
- Manage committee structures
- Monitor system performance
- Access all system data

**Access Level:** Full system access

### Secretary (SECRETARY, COMMITTEE_SECRETARY, DELEGATION_SECRETARY)

**Responsibilities:**
- Meeting management and coordination
- Document preparation and distribution
- Resolution assignment and tracking
- Communication with committee members

**Key Features:**
- Create and manage meetings
- Send meeting invitations
- Assign resolutions to subcommittees
- Take meeting minutes
- Manage location-based restrictions

**Access Level:** Country-specific access

### Chair (CHAIR, VICE_CHAIR)

**Responsibilities:**
- Subcommittee leadership and oversight
- Report submission and review
- Member coordination
- Decision making

**Key Features:**
- Submit progress reports
- Review member submissions
- Access subcommittee dashboard
- Manage subcommittee activities

**Access Level:** Subcommittee-specific access

### Head of Delegation (HOD)

**Special Note:** HOD privileges are automatically granted to Chairs of "Head of Delegation" subcommittees.

**Responsibilities:**
- Delegation oversight and management
- High-level reporting
- Strategic decision making
- Cross-committee coordination

**Key Features:**
- Access HOD dashboard
- View delegation performance metrics
- Submit delegation reports
- Manage delegation activities

**Access Level:** Delegation-wide access

### Commissioner General (COMMISSIONER_GENERAL)

**Responsibilities:**
- High-level oversight and governance
- Strategic planning and policy
- Cross-committee coordination
- Performance monitoring

**Key Features:**
- Access commissioner dashboard
- View system-wide performance metrics
- Generate comprehensive reports
- Monitor committee activities

**Access Level:** System-wide read access

### Committee Members (SUBCOMMITTEE_MEMBER, COMMITTEE_MEMBER)

**Responsibilities:**
- Active participation in committee activities
- Report submission
- Task completion
- Collaboration with other members

**Key Features:**
- Access member dashboard
- Submit individual reports
- View assigned tasks
- Participate in meetings

**Access Level:** Committee-specific access

---

## Login and Authentication

### Login Process

1. **Access Login Page**
   - Navigate to `http://localhost:3000`
   - You will see the EARACONNECT login interface

2. **Enter Credentials**
   - **Email**: Enter your assigned email address
   - **Password**: Enter your password
   - Click "Login"

3. **Authentication**
   - System validates your credentials
   - Checks your role and permissions
   - Redirects to appropriate dashboard

### Role-Based Redirection

After successful login, users are automatically redirected based on their role:

- **ADMIN** → Admin Dashboard (`/admin/dashboard`)
- **SECRETARY** → Secretary Dashboard (`/secretary/dashboard`)
- **CHAIR/VICE_CHAIR** → Chair Dashboard (`/chair/dashboard`)
- **HOD** (Chair of Head of Delegation) → HOD Dashboard (`/hod/dashboard`)
- **COMMISSIONER_GENERAL** → Commissioner Dashboard (`/commissioner/dashboard`)
- **COMMITTEE_MEMBER** → Member Dashboard (`/member/dashboard`)

### Password Management

- **Default Passwords**: Set by administrators during user creation
- **Password Security**: Strong passwords recommended
- **Password Reset**: Contact administrator for password reset

---

## Feature Usage Guide

### Dashboard Navigation

Each user role has a customized dashboard with relevant features:

#### Admin Dashboard Features
- **User Management**: Create, edit, delete users
- **Committee Management**: Manage committees and subcommittees
- **System Monitoring**: View system performance metrics
- **Reports**: Generate system-wide reports

#### Secretary Dashboard Features
- **Meeting Management**: Create and manage meetings
- **Invitation System**: Send meeting invitations
- **Resolution Assignment**: Assign resolutions to subcommittees
- **Document Management**: Upload and manage documents

#### Chair Dashboard Features
- **Report Submission**: Submit progress reports
- **Member Management**: View subcommittee members
- **Task Tracking**: Monitor assigned tasks
- **Performance Metrics**: View subcommittee performance

#### HOD Dashboard Features
- **Delegation Overview**: View delegation status
- **Performance Analytics**: Access delegation metrics
- **Cross-Committee Reports**: Generate comprehensive reports
- **Strategic Planning**: Access planning tools

### Meeting Management

#### Creating Meetings (Secretaries)

1. **Navigate to Meeting Management**
   - Click "Meetings" in the main menu
   - Click "Create New Meeting"

2. **Fill Meeting Details**
   - **Title**: Enter meeting title
   - **Date**: Select meeting date and time
   - **Location**: Specify meeting location
   - **Hosting Country**: Select hosting country
   - **Description**: Add meeting description

3. **Select Attendees**
   - Choose committees and subcommittees
   - Select specific members
   - Review attendee list

4. **Send Invitations**
   - Preview invitation content
   - Click "Send Invitations"
   - Confirm sending

#### Managing Meeting Invitations

1. **View Sent Invitations**
   - Navigate to "Invitations" section
   - View invitation status
   - Track responses

2. **Resend Invitations**
   - Select pending invitations
   - Click "Resend"
   - Confirm action

### Resolution Management

#### Assigning Resolutions (Secretaries)

1. **Access Resolution Management**
   - Navigate to "Resolutions"
   - Click "Assign Resolution"

2. **Select Resolution**
   - Choose resolution from list
   - Review resolution details

3. **Assign to Subcommittees**
   - Select target subcommittees
   - Set contribution percentages
   - Ensure percentages total 100%

4. **Submit Assignment**
   - Review assignment details
   - Click "Submit Assignment"
   - Confirm submission

#### Submitting Reports (Chairs/Members)

1. **Access Report Submission**
   - Navigate to "Reports"
   - Click "Submit Report"

2. **Select Resolution**
   - Choose assigned resolution
   - View resolution details

3. **Fill Report Details**
   - **Progress Details**: Describe progress (minimum 10 characters)
   - **Performance Percentage**: Enter completion percentage (0-100%)
   - **Hindrances**: Describe any obstacles
   - **Next Steps**: Outline future actions

4. **Submit Report**
   - Review report details
   - Click "Submit Report"
   - Confirm submission

### Performance Analytics

#### Viewing Performance Metrics

1. **Access Performance Dashboard**
   - Navigate to "Performance" or "Analytics"
   - Select time period
   - Choose filters (country, committee, etc.)

2. **Available Metrics**
   - **Approval Rate**: Percentage of approved resolutions
   - **Task Completion**: Percentage of completed tasks
   - **Average Resolution Time**: Time to resolve issues
   - **Member Participation**: Active member percentage

3. **Export Data**
   - Select desired metrics
   - Click "Export"
   - Choose format (PDF, Excel, CSV)

---

## Dashboard Overview

### Common Dashboard Elements

All dashboards include:
- **Navigation Menu**: Access to all features
- **User Profile**: Current user information
- **Notifications**: System notifications and alerts
- **Quick Actions**: Common tasks shortcuts
- **Statistics Cards**: Key metrics display

### Role-Specific Dashboards

#### Admin Dashboard
- **System Overview**: Total users, committees, meetings
- **User Management**: Create and manage users
- **Committee Management**: Manage committee structure
- **System Reports**: Generate system-wide reports

#### Secretary Dashboard
- **Meeting Statistics**: Upcoming and completed meetings
- **Resolution Status**: Pending and completed resolutions
- **Location Validation**: Country assignment status
- **Quick Actions**: Create meeting, assign resolution

#### Chair Dashboard
- **Subcommittee Overview**: Member count and activities
- **Report Status**: Submitted and pending reports
- **Task Progress**: Assigned task completion
- **Performance Metrics**: Subcommittee performance

#### HOD Dashboard
- **Delegation Overview**: Cross-committee activities
- **Performance Analytics**: Comprehensive metrics
- **Strategic Reports**: High-level reporting
- **Planning Tools**: Strategic planning features

---

## Troubleshooting

### Common Login Issues

#### "Invalid Credentials" Error
**Problem**: Cannot login with correct credentials
**Solutions**:
1. Verify email address spelling
2. Check password case sensitivity
3. Contact administrator to reset password
4. Ensure account is active

#### "Account Not Found" Error
**Problem**: System doesn't recognize email address
**Solutions**:
1. Contact administrator to verify account creation
2. Check if account was deactivated
3. Verify correct email address

### Dashboard Access Issues

#### "Access Denied" Error
**Problem**: Cannot access certain features
**Solutions**:
1. Verify role permissions
2. Contact administrator for role updates
3. Check if feature requires specific subcommittee assignment

#### Dashboard Not Loading
**Problem**: Dashboard appears blank or doesn't load
**Solutions**:
1. Refresh the page
2. Clear browser cache
3. Check internet connection
4. Try different browser

### Meeting Management Issues

#### Cannot Create Meetings
**Problem**: Meeting creation fails
**Solutions**:
1. Verify country assignment (for secretaries)
2. Check required fields completion
3. Ensure hosting country is selected
4. Contact administrator for permissions

#### Invitations Not Sending
**Problem**: Meeting invitations fail to send
**Solutions**:
1. Check email configuration
2. Verify recipient email addresses
3. Ensure internet connection
4. Contact system administrator

### Report Submission Issues

#### Cannot Submit Reports
**Problem**: Report submission fails
**Solutions**:
1. Verify resolution assignment
2. Check required field completion
3. Ensure progress details meet minimum length
4. Verify performance percentage is valid (0-100%)

#### Reports Not Saving
**Problem**: Reports disappear after submission
**Solutions**:
1. Check internet connection
2. Verify database connectivity
3. Contact administrator for data recovery
4. Try resubmitting report

### Performance Issues

#### Slow Loading Times
**Problem**: System responds slowly
**Solutions**:
1. Check internet connection speed
2. Close unnecessary browser tabs
3. Clear browser cache
4. Try different browser

#### Data Not Updating
**Problem**: Information appears outdated
**Solutions**:
1. Refresh the page
2. Check internet connection
3. Verify database connectivity
4. Contact administrator

---

## FAQ

### General Questions

**Q: What browsers are supported?**
A: Chrome 90+, Firefox 88+, Safari 14+, and Edge 90+ are supported.

**Q: Can I access the system from mobile devices?**
A: Yes, the system is responsive and works on tablets and smartphones.

**Q: Is my data secure?**
A: Yes, the system uses secure authentication and database-driven security.

**Q: Can I change my password?**
A: Password changes must be requested through your administrator.

### User Management

**Q: How do I get a user account?**
A: Contact your system administrator to create an account.

**Q: Can I have multiple roles?**
A: No, each user has one primary role, but some roles have extended privileges.

**Q: What if I forget my password?**
A: Contact your administrator for password reset.

### Meeting Management

**Q: Can I schedule meetings across different countries?**
A: Yes, but secretaries can only manage meetings in their assigned country.

**Q: How do I invite external participants?**
A: External participants must have user accounts in the system.

**Q: Can I reschedule meetings?**
A: Yes, meetings can be rescheduled if no responses have been received.

### Reporting

**Q: How often should I submit reports?**
A: Report frequency depends on your role and assigned tasks.

**Q: Can I edit submitted reports?**
A: No, reports cannot be edited after submission, but new reports can be submitted.

**Q: What if I make a mistake in my report?**
A: Submit a new report with corrections and explanations.

### Technical Issues

**Q: What if the system is down?**
A: Contact your system administrator immediately.

**Q: Can I work offline?**
A: No, the system requires internet connectivity.

**Q: How do I update my profile information?**
A: Contact your administrator to update profile information.

---

## Support Information

### Getting Help

**System Administrator Contact:**
- **Email**: admin@earaconnect.com
- **Phone**: [Contact your local administrator]
- **Office Hours**: [Contact your local administrator]

**Technical Support:**
- **Email**: [Contact your local administrator]
- **Response Time**: Within 24 hours during business days

### Documentation

**Additional Resources:**
- **Admin Guide**: Detailed administrator documentation
- **Secretary Guide**: Secretary-specific functionality guide
- **Chair Guide**: Chair and HOD functionality guide
- **API Documentation**: Technical API reference

### Training

**User Training:**
- **New User Orientation**: Contact administrator for training
- **Role-Specific Training**: Available for each user role
- **Advanced Features**: Training for advanced functionality

### Feedback

**System Improvement:**
- **Feature Requests**: Submit through administrator
- **Bug Reports**: Report issues immediately
- **User Experience**: Share feedback for improvements

---

**End of User Guide**

*This document is maintained by the EARACONNECT Development Team. For updates and revisions, contact your system administrator.*

---

**Document Version History:**
- **v4.0** (January 2025): Initial comprehensive user guide
- **Previous versions**: Available through administrator

