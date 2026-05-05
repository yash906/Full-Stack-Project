// API URL - routes to localhost in development, backend private domain in production
const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'http://web.railway.internal:5000/api';

let token = localStorage.getItem('token');
let currentUser = null;
let currentProjectId = null;
let currentTaskId = null;

function initApp() {
    if (token) {
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'flex';
        getCurrentUser();
        loadDashboard();
        loadProjects();
    }
}

function toggleAuthForm() {
    document.getElementById('loginForm').classList.toggle('active');
    document.getElementById('signupForm').classList.toggle('active');
    clearAuthInputs();
}

function clearAuthInputs() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupAdmin').checked = false;
}

async function signup() {
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const isAdmin = document.getElementById('signupAdmin').checked;

    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, isAdmin })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Signup failed');
            return;
        }

        token = data.token;
        localStorage.setItem('token', token);
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'flex';
        getCurrentUser();
        loadDashboard();
        loadProjects();
    } catch (error) {
        console.error(error);
        alert('Signup error');
    }
}

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill all fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Login failed');
            return;
        }

        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'flex';
        document.getElementById('userEmail').textContent = currentUser.email;
        loadDashboard();
        loadProjects();
    } catch (error) {
        console.error(error);
        alert('Login error');
    }
}

async function getCurrentUser() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const user = await response.json();
        currentUser = user;
        document.getElementById('userEmail').textContent = user.email;
    } catch (error) {
        console.error(error);
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
    clearAuthInputs();
}

// Page Navigation
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Remove active class from all menu buttons
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected page
    document.getElementById(pageName + 'Page').classList.add('active');

    // Add active class to clicked button
    event.target.classList.add('active');

    if (pageName === 'dashboard') {
        loadDashboard();
    } else if (pageName === 'projects') {
        loadProjects();
    } else if (pageName === 'tasks') {
        loadTasks();
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_URL}/tasks/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const stats = await response.json();

        // Create stats cards
        const statsHTML = `
            <div class="stat-card">
                <h3>Total Projects</h3>
                <div class="number">${stats.totalProjects}</div>
            </div>
            <div class="stat-card">
                <h3>Total Tasks</h3>
                <div class="number">${stats.totalTasks}</div>
            </div>
            <div class="stat-card">
                <h3>To Do</h3>
                <div class="number">${stats.toDoCount}</div>
            </div>
            <div class="stat-card">
                <h3>In Progress</h3>
                <div class="number">${stats.inProgressCount}</div>
            </div>
            <div class="stat-card">
                <h3>Completed</h3>
                <div class="number">${stats.completedCount}</div>
            </div>
            <div class="stat-card">
                <h3>Overdue</h3>
                <div class="number">${stats.overdueCount}</div>
            </div>
        `;

        document.getElementById('statsContainer').innerHTML = statsHTML;

        // Load overdue tasks
        const overdueHTML = stats.overdueTasks.length > 0
            ? stats.overdueTasks.map(task => `
                <div class="task-card">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('')
            : '<p style="color: #a0aec0;">No overdue tasks</p>';

        document.getElementById('overdueTasksList').innerHTML = overdueHTML;
    } catch (error) {
        console.error(error);
    }
}

// Project Functions
async function loadProjects() {
    try {
        const response = await fetch(`${API_URL}/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const projects = await response.json();

        // Populate project filter dropdown
        const projectFilter = document.getElementById('projectFilter');
        projectFilter.innerHTML = '<option value="">All Projects</option>' +
            projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');

        // Populate task project dropdown
        const taskProject = document.getElementById('taskProject');
        taskProject.innerHTML = '<option value="">Select Project</option>' +
            projects.map(p => `<option value="${p._id}">${p.name}</option>`).join('');

        // Display projects
        const projectsHTML = projects.map(project => `
            <div class="project-card" onclick="showProjectDetails('${project._id}')">
                <h3>${project.name}</h3>
                <p>${project.description || 'No description'}</p>
                <div class="project-meta">
                    <span>${project.members.length} members</span>
                    <span>${new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');

        document.getElementById('projectsList').innerHTML = projectsHTML || '<p>No projects yet</p>';
    } catch (error) {
        console.error(error);
    }
}

function showCreateProjectModal() {
    document.getElementById('projectModal').style.display = 'block';
}

async function createProject(event) {
    event.preventDefault();

    const name = document.getElementById('projectName').value;
    const description = document.getElementById('projectDescription').value;

    try {
        const response = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name, description })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to create project');
            return;
        }

        alert('Project created successfully!');
        closeModal('projectModal');
        document.getElementById('projectName').value = '';
        document.getElementById('projectDescription').value = '';
        loadProjects();
    } catch (error) {
        console.error(error);
        alert('Error creating project');
    }
}

async function showProjectDetails(projectId) {
    try {
        const response = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const project = await response.json();
        currentProjectId = projectId;

        document.getElementById('projectDetailTitle').textContent = project.name;
        document.getElementById('projectDetailDesc').textContent = project.description || 'No description';

        // Display members
        const membersHTML = `
            <h4>Members</h4>
            ${project.members.map(member => `
                <div class="member-item">
                    <div>
                        <div class="member-name">${member.name}</div>
                        <div class="member-role">${member.email}</div>
                    </div>
                    ${project.admin._id === currentUser.id ? 
                        `<button class="btn btn-small btn-danger" onclick="removeMember('${member._id}')">Remove</button>` 
                        : ''}
                </div>
            `).join('')}
        `;

        document.getElementById('projectMembers').innerHTML = membersHTML;

        // Load users for member select if admin
        if (project.admin._id === currentUser.id) {
            const usersResponse = await fetch(`${API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const users = await usersResponse.json();
            const memberSelect = document.getElementById('memberSelect');
            memberSelect.innerHTML = '<option value="">Select User</option>' +
                users.filter(u => !project.members.some(m => m._id === u._id))
                    .map(u => `<option value="${u._id}">${u.name}</option>`).join('');
        }

        document.getElementById('projectDetailsModal').style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}

function showAddMemberForm() {
    const form = document.getElementById('addMemberForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

async function addMember() {
    const userId = document.getElementById('memberSelect').value;

    if (!userId) {
        alert('Please select a user');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/projects/${currentProjectId}/members`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to add member');
            return;
        }

        alert('Member added successfully!');
        showProjectDetails(currentProjectId);
    } catch (error) {
        console.error(error);
        alert('Error adding member');
    }
}

async function removeMember(userId) {
    if (!confirm('Remove this member?')) return;

    try {
        const response = await fetch(
            `${API_URL}/projects/${currentProjectId}/members/${userId}`,
            {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        if (!response.ok) {
            alert('Failed to remove member');
            return;
        }

        alert('Member removed successfully!');
        showProjectDetails(currentProjectId);
    } catch (error) {
        console.error(error);
        alert('Error removing member');
    }
}

async function deleteProject() {
    if (!confirm('Delete this project? This cannot be undone.')) return;

    try {
        const response = await fetch(`${API_URL}/projects/${currentProjectId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Failed to delete project');
            return;
        }

        alert('Project deleted successfully!');
        closeModal('projectDetailsModal');
        loadProjects();
    } catch (error) {
        console.error(error);
        alert('Error deleting project');
    }
}

function showProjectTasks() {
    closeModal('projectDetailsModal');
    showPage('tasks');
    document.getElementById('projectFilter').value = currentProjectId;
    loadTasks();
}

// Task Functions
async function loadTasks() {
    try {
        const projectId = document.getElementById('projectFilter').value;
        const url = projectId
            ? `${API_URL}/tasks/project/${projectId}`
            : `${API_URL}/projects`;

        let tasks = [];

        if (projectId) {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            tasks = await response.json();
        } else {
            // Get all tasks from all projects
            const projectsResponse = await fetch(`${API_URL}/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const projects = await projectsResponse.json();

            for (const project of projects) {
                const tasksResponse = await fetch(`${API_URL}/tasks/project/${project._id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const projectTasks = await tasksResponse.json();
                tasks = [...tasks, ...projectTasks];
            }
        }

        const tasksHTML = tasks.length > 0
            ? tasks.map(task => `
                <div class="task-card">
                    <div class="task-header">
                        <div class="task-title">${task.title}</div>
                        <span class="task-status status-${task.status.toLowerCase().replace(' ', '')}">
                            ${task.status}
                        </span>
                    </div>
                    <div class="task-description">${task.description || 'No description'}</div>
                    <div class="task-meta">
                        <span>👤 ${task.assignee ? task.assignee.name : 'Unassigned'}</span>
                        <span>📅 ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                        <span>⚠️ ${task.priority}</span>
                    </div>
                    <div class="task-actions">
                        <button onclick="showEditTaskModal('${task._id}')">Edit</button>
                        <button onclick="deleteTask('${task._id}')">Delete</button>
                    </div>
                </div>
            `).join('')
            : '<p>No tasks</p>';

        document.getElementById('tasksList').innerHTML = tasksHTML;
    } catch (error) {
        console.error(error);
    }
}

function showCreateTaskModal() {
    document.getElementById('taskModal').style.display = 'block';
}

async function createTask(event) {
    event.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const projectId = document.getElementById('taskProject').value;
    const assignee = document.getElementById('taskAssignee').value || null;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;

    if (!title || !projectId) {
        alert('Please fill required fields');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                projectId,
                assignee,
                dueDate,
                priority
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to create task');
            return;
        }

        alert('Task created successfully!');
        closeModal('taskModal');
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskProject').value = '';
        document.getElementById('taskAssignee').value = '';
        document.getElementById('taskDueDate').value = '';
        loadTasks();
    } catch (error) {
        console.error(error);
        alert('Error creating task');
    }
}

async function showEditTaskModal(taskId) {
    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const task = await response.json();
        currentTaskId = taskId;

        document.getElementById('editTaskTitle').value = task.title;
        document.getElementById('editTaskDescription').value = task.description || '';
        document.getElementById('editTaskStatus').value = task.status;
        document.getElementById('editTaskPriority').value = task.priority;
        document.getElementById('editTaskDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';

        document.getElementById('editTaskModal').style.display = 'block';
    } catch (error) {
        console.error(error);
    }
}

async function updateTask(event) {
    event.preventDefault();

    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const status = document.getElementById('editTaskStatus').value;
    const priority = document.getElementById('editTaskPriority').value;
    const dueDate = document.getElementById('editTaskDueDate').value;

    try {
        const response = await fetch(`${API_URL}/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                status,
                priority,
                dueDate
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Failed to update task');
            return;
        }

        alert('Task updated successfully!');
        closeModal('editTaskModal');
        loadTasks();
    } catch (error) {
        console.error(error);
        alert('Error updating task');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Delete this task?')) return;

    try {
        const response = await fetch(`${API_URL}/tasks/${taskId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            alert('Failed to delete task');
            return;
        }

        alert('Task deleted successfully!');
        loadTasks();
    } catch (error) {
        console.error(error);
        alert('Error deleting task');
    }
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Add button to tasks page
const tasksPageHeader = document.addEventListener('DOMContentLoaded', () => {
    // Create task button will be added dynamically
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    // Add create task button to tasks page header
    const tasksPage = document.getElementById('tasksPage');
    if (tasksPage) {
        const pageHeader = tasksPage.querySelector('.page-header');
        if (pageHeader && !pageHeader.querySelector('.create-task-btn')) {
            const btn = document.createElement('button');
            btn.className = 'btn btn-primary';
            btn.textContent = '+ New Task';
            btn.onclick = showCreateTaskModal;
            pageHeader.appendChild(btn);
        }
    }
});
