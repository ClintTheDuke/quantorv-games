let recoveryVerified = false;
let resetForm = null;
let accessMessage = null;

function enableResetForm() {
    if (!recoveryVerified || !resetForm || !accessMessage) return;

    resetForm.hidden = false;
    resetForm.classList.add("active");

    resetForm.querySelectorAll("input, button").forEach((control) => {
        control.disabled = false;
    });

    accessMessage.textContent =
        "Recovery link verified. You can now choose a new password.";
}

if (window.supaDb) {
    window.supaDb.auth.onAuthStateChange((event, session) => {
        if (event === "PASSWORD_RECOVERY" && session) {
            recoveryVerified = true;
            enableResetForm();
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const resetForm = document.getElementById("resetPasswordForm");
    const accessMessage = document.getElementById("resetAccessMessage");

    // Keep the form locked until Supabase confirms password recovery.
    if (!window.supaDb || !resetForm || !accessMessage) {
        accessMessage.textContent =
            "Unable to initialize password recovery. Please try again.";
        return;
    }

    resetForm.hidden = true;

    resetForm.querySelectorAll("input, button").forEach((control) => {
        control.disabled = true;
    });

    let recoveryVerified = false;

    const { data: authListener } = window.supaDb.auth.onAuthStateChange(
        (event, session) => {
            if (event === "PASSWORD_RECOVERY" && session) {
                recoveryVerified = true;

                clearTimeout(recoveryTimeout);

                resetForm.hidden = false;
                resetForm.classList.add("active");

                resetForm.querySelectorAll("input, button").forEach((control) => {
                    control.disabled = false;
                });

                accessMessage.textContent =
                    "Recovery link verified. You can now choose a new password.";
            }
        }
    );

    // Reject direct visits and links that do not start a recovery flow.
    /*const recoveryTimeout = setTimeout(() => {
        if (recoveryVerified) return;

        accessMessage.textContent =
            "This recovery link is invalid or expired. Please request a new password reset from the sign-in page.";

        resetForm.hidden = true;
    }, 3000);*/
    // Keep the form locked until recovery is verified.
resetForm.hidden = true;

resetForm.querySelectorAll("input, button").forEach((control) => {
    control.disabled = true;
});

// Handle recovery events that arrived before the DOM was ready.
if (recoveryVerified) {
    enableResetForm();
} else {
    accessMessage.textContent =
        "Verifying your password recovery link...";
}

/*======= this section replaces the timer block above, to avoid the timeout issue and allow for proper verification*/

    
    // ===== LIVE PASSWORD VALIDATION =====

    const newPasswordInput = document.getElementById("newPassword");

    if (newPasswordInput) {
        newPasswordInput.addEventListener("input", () => {
            const password = newPasswordInput.value;

            const requirements = {
                reqLength: password.length >= 8,
                reqUppercase: /[A-Z]/.test(password),
                reqLowercase: /[a-z]/.test(password),
                reqNumber: /[0-9]/.test(password),
                reqSpecial: /[^A-Za-z0-9]/.test(password)
            };

            Object.entries(requirements).forEach(([id, passed]) => {
                const requirement = document.getElementById(id);

                if (!requirement) return;

                requirement.classList.toggle("valid", passed);

                const indicator = requirement.querySelector("span");

                if (indicator) {
                    indicator.textContent = passed ? "✓" : "○";
                }
            });
        });
    }

    // ===== PASSWORD CONFIRMATION =====

    const confirmPasswordInput =
        document.getElementById("confirmPassword");

    const passwordMatch = document.getElementById("passwordMatch");

    function checkPasswordMatch() {
        if (!newPasswordInput || !confirmPasswordInput || !passwordMatch) {
            return false;
        }

        const password = newPasswordInput.value;
        const confirmation = confirmPasswordInput.value;

        if (!confirmation) {
            passwordMatch.textContent = "";
            passwordMatch.classList.remove("valid", "invalid");
            return false;
        }

        const matches = password === confirmation;

        passwordMatch.textContent = matches
            ? "Passwords match."
            : "Passwords do not match.";

        passwordMatch.classList.toggle("valid", matches);
        passwordMatch.classList.toggle("invalid", !matches);

        return matches;
    }

    if (newPasswordInput && confirmPasswordInput) {
        newPasswordInput.addEventListener("input", checkPasswordMatch);
        confirmPasswordInput.addEventListener("input", checkPasswordMatch);
    }


    // ===== SHOW / HIDE PASSWORD CONTROLS =====

    document.querySelectorAll("[data-password-toggle]").forEach((button) => {
        button.addEventListener("click", () => {
            const inputId = button.dataset.passwordToggle;
            const passwordInput = document.getElementById(inputId);

            if (!passwordInput) return;

            const showingPassword = passwordInput.type === "password";

            passwordInput.type = showingPassword ? "text" : "password";

            button.textContent = showingPassword ? "Hide" : "Show";

            button.setAttribute(
                "aria-label",
                showingPassword
                    ? "Hide password"
                    : "Show password"
            );

            button.setAttribute(
                "aria-pressed",
                String(showingPassword)
            );
        });
    });

    
    // ===== UPDATE PASSWORD =====

    const resetPasswordBtn =
        document.getElementById("resetPasswordBtn");

    const resetMessage =
        document.getElementById("resetMessage");

    const signinLink =
        document.getElementById("resetSigninLink");

    if (resetForm) {
        resetForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!recoveryVerified) {
                resetMessage.textContent =
                    "Your recovery link has not been verified. Please request a new one.";
                return;
            }

            const password = newPasswordInput.value;
            const confirmation = confirmPasswordInput.value;

            const passwordIsValid =
                password.length >= 8 &&
                /[A-Z]/.test(password) &&
                /[a-z]/.test(password) &&
                /[0-9]/.test(password) &&
                /[^A-Za-z0-9]/.test(password);

            if (!passwordIsValid) {
                resetMessage.textContent =
                    "Please meet all five password requirements.";
                newPasswordInput.focus();
                return;
            }

            if (password !== confirmation) {
                resetMessage.textContent =
                    "Your passwords do not match.";
                confirmPasswordInput.focus();
                return;
            }

            resetPasswordBtn.disabled = true;
            resetPasswordBtn.textContent = "Updating Password...";
            resetMessage.textContent = "Please wait while your password is updated.";

            try {
                const { error } = await window.supaDb.auth.updateUser({
                    password: password
                });

                if (error) {
                    throw error;
                }

                resetMessage.textContent =
                    "Your password has been updated successfully.";

                resetPasswordBtn.textContent = "Password Updated";

                resetForm.querySelectorAll("input").forEach((input) => {
                    input.disabled = true;
                    input.value = "";
                });

                resetForm.querySelectorAll("[data-password-toggle]").forEach((button) => {
                    button.disabled = true;
                });

                passwordMatch.textContent = "";

                signinLink.hidden = false;

                
                // End the recovery session without treating sign-out failure
// as a password update failure.
window.supaDb.auth.signOut().catch((error) => {
    console.error("Sign-out error:", error);
});

// Redirect to the homepage after showing the success message.
setTimeout(() => {
    window.location.href = "index.html";
}, 2500);
            } catch (error) {
                console.error("Password reset error:", error);

                resetMessage.textContent =
                    "We couldn't update your password. Your recovery link may have expired. Please try again or request a new link.";

                resetPasswordBtn.disabled = false;
                resetPasswordBtn.textContent = "Update Password";
            }
        });
    }

});
