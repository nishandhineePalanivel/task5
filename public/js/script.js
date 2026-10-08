/**
 * Cognifyz Web Development Internship - Level 3, Task 5
 * Front-End Interaction & RESTful API Communication Engine
 * 
 * Implements full CRUD operations (GET, POST, PUT, DELETE) via fetch(),
 * dynamic DOM rendering, state management, search filtering, modals,
 * and maintains all Task 4 form validation, strength meter, and SPA hash routing.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const registrationForm = document.getElementById('registration-form') || document.querySelector('form.needs-validation');
  
  // Registration Form Inputs
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const ageInput = document.getElementById('age');
  const courseInput = document.getElementById('course');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const termsCheckbox = document.getElementById('terms');

  // Interactive buttons & toggles
  const togglePasswordBtn = document.getElementById('toggle-password');
  const toggleConfirmPasswordBtn = document.getElementById('toggle-confirm-password');

  // Character counter & password strength/checklist
  const nameCharCount = document.getElementById('name-char-count');
  const strengthBar = document.getElementById('password-strength-bar');
  const strengthText = document.getElementById('password-strength-text');
  const reqLength = document.getElementById('req-length');
  const reqUpper = document.getElementById('req-uppercase');
  const reqLower = document.getElementById('req-lowercase');
  const reqNumber = document.getElementById('req-number');
  const reqSpecial = document.getElementById('req-special');

  // Live preview elements
  const previewName = document.getElementById('preview-name');
  const previewEmail = document.getElementById('preview-email');
  const previewPhone = document.getElementById('preview-phone');
  const previewCourse = document.getElementById('preview-course');
  const previewStrength = document.getElementById('preview-strength');
  const previewTerms = document.getElementById('preview-terms');

  // Router views & containers
  const mainPortalContent = document.getElementById('main-portal-content');
  const dashboardSection = document.getElementById('dashboard-section');
  const successSection = document.getElementById('success-section');
  const notFoundSection = document.getElementById('not-found-section');

  // Dashboard DOM Elements
  const dashboardTableBody = document.getElementById('dashboard-table-body');
  const dashboardLoading = document.getElementById('dashboard-loading');
  const dashboardEmpty = document.getElementById('dashboard-empty');
  const dashboardError = document.getElementById('dashboard-error');
  const dashboardErrorMessage = document.getElementById('dashboard-error-message');
  const dashboardSearch = document.getElementById('dashboard-search');
  const btnRefreshDashboard = document.getElementById('btn-refresh-dashboard');
  const dashboardTotalCount = document.getElementById('dashboard-total-count');

  // Edit Modal DOM Elements
  const editModalEl = document.getElementById('editRegistrationModal');
  const editForm = document.getElementById('edit-registration-form');
  const editIdInput = document.getElementById('edit-id');
  const editNameInput = document.getElementById('edit-name');
  const editEmailInput = document.getElementById('edit-email');
  const editPhoneInput = document.getElementById('edit-phone');
  const editAgeInput = document.getElementById('edit-age');
  const editCourseInput = document.getElementById('edit-course');
  const editSaveBtn = document.getElementById('edit-save-btn');

  // Delete Modal DOM Elements
  const deleteModalEl = document.getElementById('deleteRegistrationModal');
  const deleteConfirmName = document.getElementById('delete-confirm-name');
  const deleteConfirmBtn = document.getElementById('delete-confirm-btn');

  // Toast / Notification Container
  const apiNotificationAlert = document.getElementById('api-notification-alert');

  // Success view elements
  const successName = document.getElementById('success-name');
  const successDetailName = document.getElementById('success-detail-name');
  const successDetailEmail = document.getElementById('success-detail-email');
  const successDetailPhone = document.getElementById('success-detail-phone');
  const successDetailCourse = document.getElementById('success-detail-course');
  const successDetailAge = document.getElementById('success-detail-age');
  const successTimestamp = document.getElementById('success-timestamp');

  // Internal Application State
  let registrationsList = [];
  let isRegistrationComplete = false;
  let targetDeleteId = null;
  let bootstrapEditModal = null;
  let bootstrapDeleteModal = null;

  if (typeof bootstrap !== 'undefined') {
    if (editModalEl) bootstrapEditModal = new bootstrap.Modal(editModalEl);
    if (deleteModalEl) bootstrapDeleteModal = new bootstrap.Modal(deleteModalEl);
  }

  // --------------------------------------------------------------------------
  // 2. VALIDATION UTILITY FUNCTIONS (Task 4 Core Functionality Preserved)
  // --------------------------------------------------------------------------

  function validateName(value) {
    const trimmed = value.trim();
    if (!trimmed) return { isValid: false, message: 'Full name is required.' };
    if (trimmed.length < 2) return { isValid: false, message: 'Name must be at least 2 characters long.' };
    if (/^\d+$/.test(trimmed)) return { isValid: false, message: 'Name cannot contain only numbers.' };
    return { isValid: true, message: 'Valid name.' };
  }

  function validateEmail(value) {
    const trimmed = value.trim();
    if (!trimmed) return { isValid: false, message: 'Email address is required.' };
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmed)) return { isValid: false, message: 'Please enter a valid email address.' };
    return { isValid: true, message: 'Valid email.' };
  }

  function validatePhone(value) {
    const trimmed = value.trim();
    if (!trimmed) return { isValid: false, message: 'Phone number is required.' };
    if (/[^\d]/.test(trimmed)) return { isValid: false, message: 'Phone number must contain digits only.' };
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmed)) return { isValid: false, message: 'Valid 10-digit mobile number required (starts with 6-9).' };
    return { isValid: true, message: 'Valid 10-digit phone number.' };
  }

  function validateAge(value) {
    const trimmed = value.trim();
    if (!trimmed) return { isValid: false, message: 'Age is required.' };
    const ageNum = parseInt(trimmed, 10);
    if (isNaN(ageNum) || ageNum < 16 || ageNum > 100) return { isValid: false, message: 'Age must be between 16 and 100.' };
    return { isValid: true, message: 'Valid age.' };
  }

  function validateCourse(value) {
    if (!value || value === '') return { isValid: false, message: 'Please select an engineering course.' };
    return { isValid: true, message: 'Course selected.' };
  }

  function checkPasswordCriteria(password) {
    return {
      hasMinLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
  }

  function validatePassword(value) {
    if (!value) return { isValid: false, message: 'Password is required.', score: 0 };
    const criteria = checkPasswordCriteria(value);
    const score = Object.values(criteria).filter(Boolean).length;
    if (!criteria.hasMinLength) return { isValid: false, message: 'Password must be at least 8 characters long.', score, criteria };
    if (!criteria.hasUpper) return { isValid: false, message: 'Must contain an uppercase letter.', score, criteria };
    if (!criteria.hasLower) return { isValid: false, message: 'Must contain a lowercase letter.', score, criteria };
    if (!criteria.hasNumber) return { isValid: false, message: 'Must contain a number.', score, criteria };
    if (!criteria.hasSpecial) return { isValid: false, message: 'Must contain a special character (!@#$%^&*).', score, criteria };
    return { isValid: true, message: 'Strong password meeting all requirements.', score, criteria };
  }

  function validateConfirmPassword(confirmValue, passwordValue) {
    if (!confirmValue) return { isValid: false, message: 'Please confirm your password.' };
    if (confirmValue !== passwordValue) return { isValid: false, message: 'Passwords do not match.' };
    return { isValid: true, message: 'Passwords match.' };
  }

  function validateTerms(isChecked) {
    if (!isChecked) return { isValid: false, message: 'You must accept the Terms and Conditions.' };
    return { isValid: true, message: 'Terms accepted.' };
  }

  // Helper to safely sanitize HTML content
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --------------------------------------------------------------------------
  // 3. UI STATE HELPERS & NOTIFICATIONS
  // --------------------------------------------------------------------------

  function setFieldState(inputEl, errorElId, validationResult) {
    const errorEl = document.getElementById(errorElId);
    if (!inputEl) return;

    if (validationResult.isValid) {
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      inputEl.setAttribute('aria-invalid', 'false');
      if (errorEl) {
        errorEl.textContent = validationResult.message;
        errorEl.className = 'valid-feedback d-block';
      }
    } else {
      inputEl.classList.remove('is-valid');
      inputEl.classList.add('is-invalid');
      inputEl.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = validationResult.message;
        errorEl.className = 'invalid-feedback d-block';
      }
    }
  }

  function clearFieldState(inputEl, errorElId) {
    const errorEl = document.getElementById(errorElId);
    if (inputEl) {
      inputEl.classList.remove('is-valid', 'is-invalid');
      inputEl.removeAttribute('aria-invalid');
    }
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.className = 'invalid-feedback';
    }
  }

  function showToastNotification(message, type = 'success') {
    if (!apiNotificationAlert) return;
    const icon = type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill';
    const alertClass = type === 'success' ? 'alert-custom-success' : 'alert-custom-danger';

    apiNotificationAlert.className = `alert ${alertClass} alert-dismissible fade show d-flex align-items-center gap-2 mb-4 shadow-sm`;
    apiNotificationAlert.innerHTML = `
      <i class="bi ${icon} fs-5"></i>
      <div>${escapeHtml(message)}</div>
      <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    apiNotificationAlert.style.display = 'flex';

    setTimeout(() => {
      if (apiNotificationAlert) apiNotificationAlert.style.display = 'none';
    }, 5000);
  }

  function updateCharacterCount() {
    if (nameInput && nameCharCount) {
      const len = nameInput.value.length;
      nameCharCount.textContent = `${len} / 50 characters`;
      if (len >= 50) nameCharCount.classList.add('text-danger', 'fw-bold');
      else nameCharCount.classList.remove('text-danger', 'fw-bold');
    }
  }

  function updateChecklist(criteria) {
    const updateItem = (elem, passed) => {
      if (!elem) return;
      const icon = elem.querySelector('i');
      if (passed) {
        elem.className = 'text-success fw-semibold d-flex align-items-center gap-1.5 py-0.5';
        if (icon) icon.className = 'bi bi-check-circle-fill text-success';
      } else {
        elem.className = 'text-muted d-flex align-items-center gap-1.5 py-0.5';
        if (icon) icon.className = 'bi bi-circle text-muted';
      }
    };
    updateItem(reqLength, criteria.hasMinLength);
    updateItem(reqUpper, criteria.hasUpper);
    updateItem(reqLower, criteria.hasLower);
    updateItem(reqNumber, criteria.hasNumber);
    updateItem(reqSpecial, criteria.hasSpecial);
  }

  function updatePasswordStrengthMeter(value) {
    if (!value || value.length === 0) {
      if (strengthBar) { strengthBar.style.width = '0%'; strengthBar.className = 'progress-bar bg-secondary'; }
      if (strengthText) { strengthText.textContent = 'None'; strengthText.className = 'badge bg-secondary'; }
      if (previewStrength) { previewStrength.textContent = 'Not set'; previewStrength.className = 'badge bg-secondary'; }
      updateChecklist({ hasMinLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false });
      return;
    }

    const criteria = checkPasswordCriteria(value);
    const score = Object.values(criteria).filter(Boolean).length;
    updateChecklist(criteria);

    let label = 'Weak', barClass = 'bg-danger', badgeClass = 'bg-danger', pct = '33%';
    if (score >= 5) { label = 'Strong'; barClass = 'bg-success'; badgeClass = 'bg-success'; pct = '100%'; }
    else if (score >= 3) { label = 'Medium'; barClass = 'bg-warning'; badgeClass = 'bg-warning text-dark'; pct = '66%'; }

    if (strengthBar) { strengthBar.style.width = pct; strengthBar.className = `progress-bar ${barClass}`; }
    if (strengthText) { strengthText.textContent = label; strengthText.className = `badge ${badgeClass}`; }
    if (previewStrength) { previewStrength.textContent = label; previewStrength.className = `badge ${badgeClass}`; }
  }

  function updateLivePreview() {
    if (previewName) previewName.textContent = nameInput && nameInput.value.trim() ? nameInput.value.trim() : 'Not entered';
    if (previewEmail) previewEmail.textContent = emailInput && emailInput.value.trim() ? emailInput.value.trim() : 'Not entered';
    if (previewPhone) previewPhone.textContent = phoneInput && phoneInput.value.trim() ? phoneInput.value.trim() : 'Not entered';
    if (previewCourse) previewCourse.textContent = courseInput && courseInput.value ? courseInput.value : 'Not selected';
    if (previewTerms) {
      const isChecked = termsCheckbox ? termsCheckbox.checked : false;
      previewTerms.textContent = isChecked ? 'Accepted' : 'Pending';
      previewTerms.className = isChecked ? 'badge bg-success-light text-success fw-bold' : 'badge bg-warning-light text-warning fw-bold';
    }
  }

  function setupPasswordToggle(btn, input) {
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPass = input.getAttribute('type') === 'password';
      input.setAttribute('type', isPass ? 'text' : 'password');
      const icon = btn.querySelector('i');
      if (icon) icon.className = isPass ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
    });
  }

  setupPasswordToggle(togglePasswordBtn, passwordInput);
  setupPasswordToggle(toggleConfirmPasswordBtn, confirmPasswordInput);

  // --------------------------------------------------------------------------
  // 4. RESTFUL API COMMUNICATION & CRUD ENGINE (Task 5 Core)
  // --------------------------------------------------------------------------

  /**
   * READ: GET /api/registrations
   */
  async function fetchRegistrations() {
    if (!dashboardTableBody) return;

    // Show Loading State
    dashboardLoading.style.display = 'block';
    dashboardEmpty.style.display = 'none';
    dashboardError.style.display = 'none';
    dashboardTableBody.innerHTML = '';

    try {
      const response = await fetch('/api/registrations');
      if (!response.ok) {
        throw new Error(`Server returned status ${response.status} (${response.statusText})`);
      }

      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        registrationsList = result.data;
        renderDashboardTable(registrationsList);
      } else {
        throw new Error(result.message || 'Invalid API response payload structure.');
      }
    } catch (err) {
      console.error('API GET /api/registrations error:', err);
      dashboardLoading.style.display = 'none';
      dashboardError.style.display = 'block';
      if (dashboardErrorMessage) dashboardErrorMessage.textContent = err.message || 'Unable to connect to REST API server.';
    }
  }

  /**
   * Renders registrations table rows dynamically in the DOM
   */
  function renderDashboardTable(data) {
    dashboardLoading.style.display = 'none';

    if (dashboardTotalCount) {
      dashboardTotalCount.textContent = `${data.length} Total Records`;
    }

    if (!data || data.length === 0) {
      dashboardEmpty.style.display = 'block';
      dashboardTableBody.innerHTML = '';
      return;
    }

    dashboardEmpty.style.display = 'none';
    let html = '';

    data.forEach((item, index) => {
      const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';

      html += `
        <tr class="align-middle">
          <td class="font-mono text-muted small">${index + 1}</td>
          <td>
            <div class="fw-bold text-dark">${escapeHtml(item.name)}</div>
            <small class="text-muted font-mono" style="font-size: 0.75rem;">ID: ${escapeHtml(item.id)}</small>
          </td>
          <td><span class="text-break">${escapeHtml(item.email)}</span></td>
          <td><span class="font-mono">+91 ${escapeHtml(item.phone)}</span></td>
          <td><span class="badge bg-light text-dark border">${escapeHtml(item.age)} yrs</span></td>
          <td><span class="badge bg-primary-light text-primary font-heading" style="font-size: 0.75rem;">${escapeHtml(item.course)}</span></td>
          <td><small class="text-muted font-mono">${dateStr}</small></td>
          <td class="text-end">
            <div class="btn-group btn-group-sm" role="group">
              <button class="btn btn-outline-primary btn-edit-reg me-1" data-id="${escapeHtml(item.id)}" title="Edit Registration">
                <i class="bi bi-pencil-fill"></i> Edit
              </button>
              <button class="btn btn-outline-danger btn-delete-reg" data-id="${escapeHtml(item.id)}" data-name="${escapeHtml(item.name)}" title="Delete Registration">
                <i class="bi bi-trash-fill"></i> Delete
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    dashboardTableBody.innerHTML = html;
    attachTableActionListeners();
  }

  /**
   * Attach Edit & Delete Action Listeners to dynamically rendered table rows
   */
  function attachTableActionListeners() {
    // Edit Button Handlers
    const editBtns = dashboardTableBody.querySelectorAll('.btn-edit-reg');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const regId = btn.getAttribute('data-id');
        openEditModal(regId);
      });
    });

    // Delete Button Handlers
    const deleteBtns = dashboardTableBody.querySelectorAll('.btn-delete-reg');
    deleteBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const regId = btn.getAttribute('data-id');
        const regName = btn.getAttribute('data-name');
        openDeleteModal(regId, regName);
      });
    });
  }

  /**
   * CREATE: POST /api/registrations
   */
  async function submitRegistrationAPI(payload) {
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.errors ? result.errors.join(' ') : (result.message || 'API creation failed.');
        throw new Error(errorMsg);
      }

      // Successful API Creation
      showToastNotification(`Registration for ${result.data.name} created successfully!`, 'success');
      await fetchRegistrations();
      return result.data;
    } catch (err) {
      console.error('API POST /api/registrations error:', err);
      showToastNotification(err.message || 'Error submitting registration to API.', 'danger');
      throw err;
    }
  }

  /**
   * UPDATE: Open Edit Modal & Populate Existing Data
   */
  function openEditModal(id) {
    const item = registrationsList.find(r => r.id === id);
    if (!item) return;

    if (editIdInput) editIdInput.value = item.id;
    if (editNameInput) editNameInput.value = item.name;
    if (editEmailInput) editEmailInput.value = item.email;
    if (editPhoneInput) editPhoneInput.value = item.phone;
    if (editAgeInput) editAgeInput.value = item.age;
    if (editCourseInput) editCourseInput.value = item.course;

    if (bootstrapEditModal) {
      bootstrapEditModal.show();
    }
  }

  /**
   * UPDATE: PUT /api/registrations/:id
   */
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = editIdInput.value;
      const payload = {
        name: editNameInput.value.trim(),
        email: editEmailInput.value.trim(),
        phone: editPhoneInput.value.trim(),
        age: editAgeInput.value.trim(),
        course: editCourseInput.value
      };

      // Validate edit form inputs
      const nameRes = validateName(payload.name);
      const emailRes = validateEmail(payload.email);
      const phoneRes = validatePhone(payload.phone);
      const ageRes = validateAge(payload.age);
      const courseRes = validateCourse(payload.course);

      setFieldState(editNameInput, 'edit-name-error', nameRes);
      setFieldState(editEmailInput, 'edit-email-error', emailRes);
      setFieldState(editPhoneInput, 'edit-phone-error', phoneRes);
      setFieldState(editAgeInput, 'edit-age-error', ageRes);
      setFieldState(editCourseInput, 'edit-course-error', courseRes);

      if (!nameRes.isValid || !emailRes.isValid || !phoneRes.isValid || !ageRes.isValid || !courseRes.isValid) {
        return;
      }

      if (editSaveBtn) {
        editSaveBtn.disabled = true;
        editSaveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Updating...';
      }

      try {
        const response = await fetch(`/api/registrations/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          const errorMsg = result.errors ? result.errors.join(' ') : (result.message || 'API update failed.');
          throw new Error(errorMsg);
        }

        if (bootstrapEditModal) bootstrapEditModal.hide();
        showToastNotification(`Registration for ${result.data.name} updated successfully!`, 'success');
        await fetchRegistrations();
      } catch (err) {
        console.error(`API PUT /api/registrations/${id} error:`, err);
        showToastNotification(err.message || 'Failed to update registration.', 'danger');
      } finally {
        if (editSaveBtn) {
          editSaveBtn.disabled = false;
          editSaveBtn.innerHTML = '<i class="bi bi-save me-1"></i> Save Changes';
        }
      }
    });
  }

  /**
   * DELETE: Open Delete Confirmation Modal
   */
  function openDeleteModal(id, name) {
    targetDeleteId = id;
    if (deleteConfirmName) deleteConfirmName.textContent = name;
    if (bootstrapDeleteModal) bootstrapDeleteModal.show();
  }

  /**
   * DELETE: DELETE /api/registrations/:id
   */
  if (deleteConfirmBtn) {
    deleteConfirmBtn.addEventListener('click', async () => {
      if (!targetDeleteId) return;

      deleteConfirmBtn.disabled = true;
      deleteConfirmBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Deleting...';

      try {
        const response = await fetch(`/api/registrations/${targetDeleteId}`, {
          method: 'DELETE'
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'API deletion failed.');
        }

        if (bootstrapDeleteModal) bootstrapDeleteModal.hide();
        showToastNotification('Registration deleted successfully from persistent database.', 'success');
        await fetchRegistrations();
      } catch (err) {
        console.error(`API DELETE /api/registrations/${targetDeleteId} error:`, err);
        showToastNotification(err.message || 'Failed to delete record from API.', 'danger');
      } finally {
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.innerHTML = '<i class="bi bi-trash-fill me-1"></i> Confirm Delete';
        targetDeleteId = null;
      }
    });
  }

  /**
   * SEARCH FILTER: Live dynamic search across table
   */
  if (dashboardSearch) {
    dashboardSearch.addEventListener('input', () => {
      const query = dashboardSearch.value.trim().toLowerCase();
      if (!query) {
        renderDashboardTable(registrationsList);
        return;
      }
      const filtered = registrationsList.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.phone.toLowerCase().includes(query) ||
        item.course.toLowerCase().includes(query)
      );
      renderDashboardTable(filtered);
    });
  }

  if (btnRefreshDashboard) {
    btnRefreshDashboard.addEventListener('click', () => {
      fetchRegistrations();
    });
  }

  // --------------------------------------------------------------------------
  // 5. EVENT LISTENERS FOR FORM & REAL-TIME VALIDATION
  // --------------------------------------------------------------------------

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updateCharacterCount();
      updateLivePreview();
      if (nameInput.value.trim().length > 0) setFieldState(nameInput, 'name-error', validateName(nameInput.value));
      else clearFieldState(nameInput, 'name-error');
    });
    nameInput.addEventListener('blur', () => setFieldState(nameInput, 'name-error', validateName(nameInput.value)));
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      updateLivePreview();
      if (emailInput.value.trim().length > 0) setFieldState(emailInput, 'email-error', validateEmail(emailInput.value));
      else clearFieldState(emailInput, 'email-error');
    });
    emailInput.addEventListener('blur', () => setFieldState(emailInput, 'email-error', validateEmail(emailInput.value)));
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      updateLivePreview();
      if (phoneInput.value.trim().length > 0) setFieldState(phoneInput, 'phone-error', validatePhone(phoneInput.value));
      else clearFieldState(phoneInput, 'phone-error');
    });
    phoneInput.addEventListener('blur', () => setFieldState(phoneInput, 'phone-error', validatePhone(phoneInput.value)));
  }

  if (ageInput) {
    ageInput.addEventListener('input', () => {
      if (ageInput.value.trim().length > 0) setFieldState(ageInput, 'age-error', validateAge(ageInput.value));
      else clearFieldState(ageInput, 'age-error');
    });
    ageInput.addEventListener('blur', () => setFieldState(ageInput, 'age-error', validateAge(ageInput.value)));
  }

  if (courseInput) {
    courseInput.addEventListener('change', () => {
      updateLivePreview();
      setFieldState(courseInput, 'course-error', validateCourse(courseInput.value));
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      updatePasswordStrengthMeter(val);
      if (val.length > 0) setFieldState(passwordInput, 'password-error', validatePassword(val));
      else clearFieldState(passwordInput, 'password-error');
      if (confirmPasswordInput && confirmPasswordInput.value.length > 0) {
        setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(confirmPasswordInput.value, val));
      }
    });
    passwordInput.addEventListener('blur', () => setFieldState(passwordInput, 'password-error', validatePassword(passwordInput.value)));
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      const val = confirmPasswordInput.value;
      const passVal = passwordInput ? passwordInput.value : '';
      if (val.length > 0) setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(val, passVal));
      else clearFieldState(confirmPasswordInput, 'confirmPassword-error');
    });
    confirmPasswordInput.addEventListener('blur', () => {
      const passVal = passwordInput ? passwordInput.value : '';
      setFieldState(confirmPasswordInput, 'confirmPassword-error', validateConfirmPassword(confirmPasswordInput.value, passVal));
    });
  }

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      updateLivePreview();
      setFieldState(termsCheckbox, 'terms-error', validateTerms(termsCheckbox.checked));
    });
  }

  // --------------------------------------------------------------------------
  // 6. FORM SUBMISSION FLOW (Connects Form to REST API)
  // --------------------------------------------------------------------------

  if (registrationForm) {
    registrationForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameRes = validateName(nameInput ? nameInput.value : '');
      const emailRes = validateEmail(emailInput ? emailInput.value : '');
      const phoneRes = validatePhone(phoneInput ? phoneInput.value : '');
      const ageRes = validateAge(ageInput ? ageInput.value : '');
      const courseRes = validateCourse(courseInput ? courseInput.value : '');
      const passwordRes = validatePassword(passwordInput ? passwordInput.value : '');
      const confirmPassRes = validateConfirmPassword(
        confirmPasswordInput ? confirmPasswordInput.value : '',
        passwordInput ? passwordInput.value : ''
      );
      const termsRes = validateTerms(termsCheckbox ? termsCheckbox.checked : false);

      setFieldState(nameInput, 'name-error', nameRes);
      setFieldState(emailInput, 'email-error', emailRes);
      setFieldState(phoneInput, 'phone-error', phoneRes);
      setFieldState(ageInput, 'age-error', ageRes);
      setFieldState(courseInput, 'course-error', courseRes);
      setFieldState(passwordInput, 'password-error', passwordRes);
      setFieldState(confirmPasswordInput, 'confirmPassword-error', confirmPassRes);
      setFieldState(termsCheckbox, 'terms-error', termsRes);

      const allValid = nameRes.isValid && emailRes.isValid && phoneRes.isValid &&
                       ageRes.isValid && courseRes.isValid && passwordRes.isValid &&
                       confirmPassRes.isValid && termsRes.isValid;

      if (!allValid) {
        const invalidFields = [
          { valid: nameRes.isValid, element: nameInput },
          { valid: emailRes.isValid, element: emailInput },
          { valid: phoneRes.isValid, element: phoneInput },
          { valid: ageRes.isValid, element: ageInput },
          { valid: courseRes.isValid, element: courseInput },
          { valid: passwordRes.isValid, element: passwordInput },
          { valid: confirmPassRes.isValid, element: confirmPasswordInput },
          { valid: termsRes.isValid, element: termsCheckbox }
        ];

        const firstInvalid = invalidFields.find(f => !f.valid);
        if (firstInvalid && firstInvalid.element) firstInvalid.element.focus();
        return;
      }

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        phone: phoneInput.value.trim(),
        age: ageInput.value.trim(),
        course: courseInput.value,
        password: passwordInput.value
      };

      const submitBtn = document.getElementById('submit-btn');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Submitting to API...';
      }

      try {
        const createdData = await submitRegistrationAPI(payload);
        isRegistrationComplete = true;

        // Populate Success View
        if (successName) successName.textContent = createdData.name;
        if (successDetailName) successDetailName.textContent = createdData.name;
        if (successDetailEmail) successDetailEmail.textContent = createdData.email;
        if (successDetailPhone) successDetailPhone.textContent = createdData.phone;
        if (successDetailAge) successDetailAge.textContent = createdData.age;
        if (successDetailCourse) successDetailCourse.textContent = createdData.course;
        if (successTimestamp) successTimestamp.textContent = new Date(createdData.createdAt).toLocaleString();

        // Clear Form Inputs
        registrationForm.reset();
        clearFieldState(nameInput, 'name-error');
        clearFieldState(emailInput, 'email-error');
        clearFieldState(phoneInput, 'phone-error');
        clearFieldState(ageInput, 'age-error');
        clearFieldState(courseInput, 'course-error');
        clearFieldState(passwordInput, 'password-error');
        clearFieldState(confirmPasswordInput, 'confirmPassword-error');
        clearFieldState(termsCheckbox, 'terms-error');
        updateCharacterCount();
        updateLivePreview();
        updatePasswordStrengthMeter('');

        // Navigate to #success route
        window.location.hash = '#success';
      } catch (err) {
        // Handled in submitRegistrationAPI
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="bi bi-send-check-fill me-1"></i> Submit Registration Application';
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // 7. CLIENT-SIDE ROUTING (SPA Hash Router)
  // --------------------------------------------------------------------------

  const validRoutes = ['#home', '#about', '#features', '#courses', '#register', '#dashboard', '#success', '#contact'];

  function handleRouting() {
    let rawHash = window.location.hash || '#home';
    let cleanHash = rawHash.split('?')[0].toLowerCase().trim();
    if (cleanHash.length > 1 && cleanHash.endsWith('/')) {
      cleanHash = cleanHash.slice(0, -1);
    }

    if (cleanHash === '#success' && !isRegistrationComplete) {
      window.location.hash = '#register';
      return;
    }

    // Check if route matches valid route list OR any existing element ID in the DOM
    const targetElement = cleanHash.startsWith('#') ? document.querySelector(cleanHash) : null;
    const isKnownRoute = validRoutes.includes(cleanHash) || cleanHash === '' || targetElement !== null;

    if (isKnownRoute) {
      if (notFoundSection) notFoundSection.style.display = 'none';

      if (cleanHash === '#success') {
        if (mainPortalContent) mainPortalContent.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'none';
        if (successSection) successSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (cleanHash === '#dashboard') {
        if (mainPortalContent) mainPortalContent.style.display = 'none';
        if (successSection) successSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        fetchRegistrations(); // Refresh data on route load
      } else {
        if (mainPortalContent) mainPortalContent.style.display = 'block';
        if (successSection) successSection.style.display = 'none';
        if (dashboardSection) dashboardSection.style.display = 'none';

        if (targetElement && cleanHash !== '#home') {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } else {
      // Invalid route -> Show 404 / Not Found Section
      if (mainPortalContent) mainPortalContent.style.display = 'none';
      if (successSection) successSection.style.display = 'none';
      if (dashboardSection) dashboardSection.style.display = 'none';
      if (notFoundSection) notFoundSection.style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active navigation link in header
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const linkHref = link.getAttribute('href');
      if (linkHref === cleanHash) link.classList.add('active');
      else link.classList.remove('active');
    });
  }

  window.addEventListener('hashchange', handleRouting);

  // Initial load execution
  updateCharacterCount();
  updateLivePreview();
  handleRouting();
});
