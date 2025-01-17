// script.js

const API_URL = "https://dm09vkpmfa.execute-api.eu-north-1.amazonaws.com/test";

// Utility Functions
function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function clearToken() {
    localStorage.removeItem("token");
}

function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
        el.style.display = "block";
    }
}

function showSuccess(message) {
    const successEl = document.getElementById("successMessage");
    if (successEl) {
        successEl.textContent = message;
        successEl.style.display = "block";
        setTimeout(() => { successEl.style.display = "none"; }, 3000);
    } else {
        alert(message); // Fallback if no success element exists
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
}

function isValidUUID(id) {
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(id);
}

// Tab Functionality
document.addEventListener("DOMContentLoaded", () => {
    const tabLinks = document.querySelectorAll(".tablink");
    const tabContents = document.querySelectorAll(".tabcontent");

    tabLinks.forEach(tab => {
        tab.addEventListener("click", () => {
            const target = tab.getAttribute("data-tab");

            // Remove active class from all tabs
            tabLinks.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Hide all tab contents
            tabContents.forEach(content => content.classList.remove("active"));

            // Show target tab content
            document.getElementById(target).classList.add("active");
        });
    });
});

// Login Functionality
if (document.getElementById("loginForm")) {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value.trim();

        try {
            const response = await fetch(`${API_URL}/token`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                const errorData = await response.json();
                showError("loginError", errorData.detail || "Login failed");
                return;
            }

            const data = await response.json();
            setToken(data.access_token);
            window.location.href = "admin.html";
        } catch (error) {
            showError("loginError", "An error occurred during login.");
            console.error("Login Error:", error);
        }
    });
}

// Admin Dashboard Functionality
if (window.location.pathname.endsWith("admin.html")) {
    const logoutBtn = document.getElementById("logoutBtn");
    const jobsTableBody = document.querySelector("#jobsTable tbody");
    const contactsTableBody = document.querySelector("#contactsTable tbody");
    const applicationsTableBody = document.querySelector("#applicationsTable tbody");
    const addJobBtn = document.getElementById("addJobBtn");
    const jobModal = document.getElementById("jobModal");
    const closeModal = document.querySelector(".close");
    const jobForm = document.getElementById("jobForm");
    const modalTitle = document.getElementById("modalTitle");
    const jobError = document.getElementById("jobError");
    const jobsError = document.getElementById("jobsError");
    const contactsError = document.getElementById("contactsError");
    const applicationsError = document.getElementById("applicationsError");
    const successMessage = document.getElementById("successMessage");

    // Redirect to login if not authenticated
    if (!getToken()) {
        window.location.href = "login.html";
    }

    // Logout Function
    logoutBtn.addEventListener("click", () => {
        clearToken();
        window.location.href = "login.html";
    });

    // Fetch and Display Jobs
    async function fetchJobs() {
        try {
            const response = await fetch(`${API_URL}/jobs`, {
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                showError("jobsError", errorData.detail || "Failed to fetch jobs.");
                return;
            }

            const jobs = await response.json();
            populateJobsTable(jobs);
            showError("jobsError", ""); // Clear any previous errors
        } catch (error) {
            console.error("Fetch Jobs Error:", error);
            showError("jobsError", "Could not fetch jobs. Please try again later.");
        }
    }

    function populateJobsTable(jobs) {
        jobsTableBody.innerHTML = "";
        jobs.forEach(job => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${job.title}</td>
                <td>${job.description}</td>
                <td>${job.location}</td>
                <td>${formatDate(job.posted_date)}</td>
                <td class="actions">
                    <button class="edit" data-id="${job.id}">Edit</button>
                    <button class="delete" data-id="${job.id}">Delete</button>
                </td>
            `;

            jobsTableBody.appendChild(tr);
        });
    }

    // Fetch and Display Contacts
    async function fetchContacts() {
        try {
            const response = await fetch(`${API_URL}/contact`, {
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                showError("contactsError", errorData.detail || "Failed to fetch contacts.");
                return;
            }

            const contacts = await response.json();
            populateContactsTable(contacts);
            showError("contactsError", ""); // Clear any previous errors
        } catch (error) {
            console.error("Fetch Contacts Error:", error);
            showError("contactsError", "Could not fetch contacts. Please try again later.");
        }
    }

    function populateContactsTable(contacts) {
        contactsTableBody.innerHTML = "";
        contacts.forEach(contact => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${contact.name}</td>
                <td>${contact.email}</td>
                <td>${contact.subject}</td>
                <td>${contact.message}</td>
                
                <td class="actions">
                    <button class="delete" data-id="${contact.id}">Delete</button>
                </td>
            `;

            contactsTableBody.appendChild(tr);
        });
    }

    // Fetch and Display Applications
    async function fetchApplications() {
        try {
            const response = await fetch(`${API_URL}/applications`, {
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                showError("applicationsError", errorData.detail || "Failed to fetch applications.");
                return;
            }

            const applications = await response.json();
            populateApplicationsTable(applications);
            showError("applicationsError", ""); // Clear any previous errors
        } catch (error) {
            console.error("Fetch Applications Error:", error);
            showError("applicationsError", "Could not fetch applications. Please try again later.");
        }
    }

    function populateApplicationsTable(applications) {
        applicationsTableBody.innerHTML = "";
        applications.forEach(app => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${app.applicant_name}</td>
                <td>${app.email}</td>
                <td>${app.job_id}</td>
                <td><a href="${app.resume_url}" target="_blank">View Resume</a></td>
               
                <td class="actions">
                    <button class="delete" data-id="${app.id}">Delete</button>
                </td>
            `;

            applicationsTableBody.appendChild(tr);
        });
    }

    // Open Modal for Adding Job
    addJobBtn.addEventListener("click", () => {
        modalTitle.textContent = "Add New Job";
        jobForm.reset(); // Clear all fields
        document.getElementById("jobId").value = ""; // Clear hidden job ID
        jobError.textContent = "";
        jobModal.style.display = "block";
    });

    // Handle Edit and Delete Buttons for Jobs
    jobsTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("edit")) {
            const jobId = e.target.getAttribute("data-id");
            
            console.log(`Editing Job ID: ${jobId}`); // Log the job ID

            if (!isValidUUID(jobId)) {
                showError("jobsError", "Invalid job ID format.");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/jobs/${jobId}`, {
                    headers: {
                        "Authorization": `Bearer ${getToken()}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || "Failed to fetch job details.");
                }

                const job = await response.json();

                modalTitle.textContent = "Edit Job";
                document.getElementById("jobId").value = job.id; // Corrected from job._id to job.id
                document.getElementById("title").value = job.title;
                document.getElementById("description").value = job.description;
                document.getElementById("location").value = job.location;
                jobError.textContent = "";
                jobModal.style.display = "block";
            } catch (error) {
                console.error("Edit Job Error:", error);
                showError("jobsError", error.message);
            }
        }

        if (e.target.classList.contains("delete")) {
            const jobId = e.target.getAttribute("data-id");
            
            console.log(`Deleting Job ID: ${jobId}`); // Log the job ID

            if (!isValidUUID(jobId)) {
                showError("jobsError", "Invalid job ID format.");
                return;
            }

            if (confirm("Are you sure you want to delete this job?")) {
                deleteJob(jobId);
            }
        }
    });

    // Handle Add/Edit Job Form Submission
    jobForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const jobId = document.getElementById("jobId").value;
        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const location = document.getElementById("location").value.trim();

        if (!title || !description || !location) {
            showError("jobError", "All fields are required.");
            return;
        }

        const jobData = { title, description, location };

        try {
            let response;
            if (jobId) {
                // Edit Job
                response = await fetch(`${API_URL}/jobs/${jobId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(jobData)
                });
            } else {
                // Add New Job
                response = await fetch(`${API_URL}/jobs`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${getToken()}`
                    },
                    body: JSON.stringify(jobData)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Operation failed.");
            }

            const result = await response.json();
            showSuccess(result.message || "Operation successful.");
            jobModal.style.display = "none";
            fetchJobs();
        } catch (error) {
            console.error("Save Job Error:", error);
            showError("jobError", error.message);
        }
    });

    // Handle Delete for Contacts
    contactsTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete")) {
            const contactId = e.target.getAttribute("data-id");
            
            console.log(`Deleting Contact ID: ${contactId}`); // Log the contact ID

            if (!isValidUUID(contactId)) {
                showError("contactsError", "Invalid contact ID format.");
                return;
            }

            if (confirm("Are you sure you want to delete this contact?")) {
                deleteContact(contactId);
            }
        }
    });

    // Handle Delete for Applications
    applicationsTableBody.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete")) {
            const applicationId = e.target.getAttribute("data-id");
            
            console.log(`Deleting Application ID: ${applicationId}`); // Log the application ID

            if (!isValidUUID(applicationId)) {
                showError("applicationsError", "Invalid application ID format.");
                return;
            }

            if (confirm("Are you sure you want to delete this application?")) {
                deleteApplication(applicationId);
            }
        }
    });

    // Delete Job Function
    async function deleteJob(jobId) {
        try {
            const response = await fetch(`${API_URL}/jobs/${jobId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete job.");
            }

            showSuccess("Job deleted successfully.");
            fetchJobs();
        } catch (error) {
            console.error("Delete Job Error:", error);
            showError("jobsError", error.message);
        }
    }

    // Delete Contact Function
    async function deleteContact(contactId) {
        try {
            const response = await fetch(`${API_URL}/contact/${contactId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete contact.");
            }

            showSuccess("Contact deleted successfully.");
            fetchContacts();
        } catch (error) {
            console.error("Delete Contact Error:", error);
            showError("contactsError", error.message);
        }
    }

    // Delete Application Function
    async function deleteApplication(applicationId) {
        try {
            const response = await fetch(`${API_URL}/applications/${applicationId}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${getToken()}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to delete application.");
            }

            showSuccess("Application deleted successfully.");
            fetchApplications();
        } catch (error) {
            console.error("Delete Application Error:", error);
            showError("applicationsError", error.message);
        }
    }

    // Close Modal
    closeModal.addEventListener("click", () => {
        jobModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target == jobModal) {
            jobModal.style.display = "none";
        }
    });

    // Initial Fetch of Data
    fetchJobs();
    fetchContacts();
    fetchApplications();
}
