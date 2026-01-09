// email-config.js - Shared EmailJS configuration for both forms

// ======================================================
// CONFIGURATION - REPLACE WITH YOUR ACTUAL VALUES
// ======================================================
const EMAILJS_CONFIG = {
  // Get these from EmailJS dashboard
  publicKey: 'ucZHO3qGZ2TBFhFb6',           // Added "user_" prefix
  serviceId: 'service_brynq0i',                 // Email Services
  contactTemplateId: 'template_0t8kj7h',        // Templates (Contact Form)
  detailedTemplateId: 'template_5yt3bh4'        // Templates (Detailed Form)
};

// ======================================================
// COMMON FUNCTIONS
// ======================================================

// Initialize EmailJS
function initEmailJS() {
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS SDK not loaded. Make sure emailjs/browser is included.');
    return false;
  }
  
  try {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('EmailJS initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
}

// Format form data for EmailJS
function formatFormData(formElement) {
  const formData = new FormData(formElement);
  const data = Object.fromEntries(formData);
  
  // Add metadata
  data.submitted_at = new Date().toLocaleString();
  data.page_url = window.location.href;
  data.user_agent = navigator.userAgent;
  
  return data;
}

// Show success/error modal
function showEmailModal(options) {
  const {
    type = 'success',
    title = '',
    message = '',
    onClose = null,
    autoClose = true
  } = options;
  
  // Remove existing modal if any
  const existingModal = document.querySelector('.emailjs-modal');
  if (existingModal) existingModal.remove();
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'emailjs-modal';
  
  // Style the modal
  Object.assign(modal.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(26, 23, 20, 0.95)',
    backdropFilter: 'blur(30px)',
    WebkitBackdropFilter: 'blur(30px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    opacity: '0',
    transition: 'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
  });
  
  // Modal content
  const modalContent = document.createElement('div');
  Object.assign(modalContent.style, {
    background: 'var(--bg-glass)',
    backdropFilter: 'blur(40px)',
    WebkitBackdropFilter: 'blur(40px)',
    border: '1px solid var(--glass-border)',
    borderRadius: 'var(--radius-xl)',
    padding: 'var(--spacing-2xl)',
    textAlign: 'center',
    maxWidth: '450px',
    width: '90%',
    transform: 'translateY(30px)',
    transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
    boxShadow: 'var(--shadow-lg)'
  });
  
  // Set icon and colors
  const isSuccess = type === 'success';
  const icon = isSuccess ? 'fa-check-circle' : 'fa-exclamation-circle';
  const iconColor = isSuccess ? 'var(--accent-gold)' : '#e74c3c';
  const buttonBg = isSuccess 
    ? 'linear-gradient(135deg, var(--color-clay), var(--color-cocoa))'
    : 'linear-gradient(135deg, #c6b8a4, #9c8b78)';
  
  // Get language for button text
  let buttonText = 'OK';
  if (typeof window.spa !== 'undefined' && window.spa.currentLang === 'fr') {
    buttonText = 'D\'accord';
  } else if (document.documentElement.lang === 'fr') {
    buttonText = 'D\'accord';
  }
  
  // Modal HTML
  modalContent.innerHTML = `
    <i class="fas ${icon}" style="font-size: 3rem; color: ${iconColor}; margin-bottom: var(--spacing-lg);"></i>
    <h3 style="color: var(--text-primary); margin-bottom: var(--spacing-md); font-size: 1.2rem; font-weight: 500;">${title}</h3>
    <p style="color: var(--text-secondary); margin-bottom: var(--spacing-xl); font-size: 0.95rem; line-height: 1.5;">${message}</p>
    <button class="cta-button" style="background: ${buttonBg}; min-width: 120px;">
      ${buttonText}
    </button>
  `;
  
  modal.appendChild(modalContent);
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => {
    modal.style.opacity = '1';
    modalContent.style.transform = 'translateY(0)';
  }, 10);
  
  // Handle button click
  const closeModal = () => {
    modal.style.opacity = '0';
    modalContent.style.transform = 'translateY(30px)';
    setTimeout(() => {
      if (modal.parentNode) {
        modal.remove();
      }
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 600);
  };
  
  setTimeout(() => {
    const okBtn = modalContent.querySelector('button');
    okBtn.addEventListener('click', closeModal);
  }, 100);
  
  // Auto-close
  if (autoClose) {
    setTimeout(closeModal, 8000);
  }
  
  return { modal, closeModal };
}

// Common form submission handler
async function submitForm(formElement, templateId, extraData = {}) {
  const submitBtn = formElement.querySelector('button[type="submit"]');
  
  if (!submitBtn) {
    console.error('Submit button not found');
    return { success: false, error: 'Submit button not found' };
  }
  
  // Save original state
  const originalText = submitBtn.innerHTML;
  const originalDisabled = submitBtn.disabled;
  
  // Show loading
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  submitBtn.disabled = true;
  
  try {
    // Get form data
    const templateParams = formatFormData(formElement);

    console.log('=== EMAILJS SUBMISSION ===');
    console.log('Template ID:', templateId);
    console.log('Service ID:', EMAILJS_CONFIG.serviceId);
    console.log('Template params:', templateParams);
    console.log('Extra data:', extraData);
    console.log('========================');
    
    // Add extra data
    Object.assign(templateParams, extraData);
    
    // Send email
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      templateId,
      templateParams
    );
    console.log('Email sent successfully:', response);
    
    if (response.status === 200) {
      console.log('Email sent successfully:', response);
      return { success: true, response };
    } else {
      throw new Error(`EmailJS responded with status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('=== EMAILJS ERROR ===');
    console.error('Error:', error);
    console.error('Status:', error.status);
    console.error('Text:', error.text);
    console.error('====================');
    
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = originalDisabled;
  }
}

// ======================================================
// EXPORT FOR USE IN OTHER FILES
// ======================================================
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  module.exports = {
    EMAILJS_CONFIG,
    initEmailJS,
    formatFormData,
    showEmailModal,
    submitForm
  };
} else {
  // Browser environment - attach to window
  window.EmailJSHelper = {
    EMAILJS_CONFIG,
    initEmailJS,
    formatFormData,
    showEmailModal,
    submitForm
  };
}

// Add this to email-config.js or index.html
async function testEmailJS() {
  try {
    // Initialize EmailJS
    emailjs.init(EMAILJS_CONFIG.publicKey);
    
    // Send a test email
    const testParams = {
      to_email: 'synthiapro.va@gmail.com',
      from_name: 'Test User',
      from_email: 'test@example.com',
      message: 'This is a test message from Synthia Pro website',
      test: true
    };
    
    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.contactTemplateId,
      testParams
    );
    
    console.log('Test email sent successfully:', response);
    alert('Test email sent! Check your inbox.');
    
  } catch (error) {
    console.error('Test email failed:', error);
    alert('Test failed: ' + error.message);
  }
}

// Call this function in browser console to test
// testEmailJS();