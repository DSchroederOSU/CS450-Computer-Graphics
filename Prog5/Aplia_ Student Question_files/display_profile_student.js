YAHOO.aplia.DisplayProfile.addCSSToggle({
	disabled : {
		course_material: {
			display_none: [ "student-course-materials", "prof-student-course-materials" ]
		}
	},
	enabled : {
		quiz: {
			display_none: ["assignment-quiz-student-login", "contents-quiz-student-login"]
		},
		payment: {
			display_table: ["aplia-payment-container"],
			display_none: ["gateway-payment-containter"]
		},
		coursehome: {
			display_none: [ "aplia-pay-now-link", "purchase-text-book-link", "gateway-reminder-padding", "aplia-reminder-spacer" ]
		},
		support: {
			display_none: [ "student-support-email-address" ]
		},
		sign_out: {
			display_none: [ "aplia-student-timeout" ],
			display_inline: [ "gateway-student-timeout" ]
		},
		my_account: {
			display_none: [ "profile-email-address",
				"profile-password",
				"profile-dateofbirth" ,
				"profile-security-questions" ,
				"edit-profile-change-your-name" ,
				"edit-profile-email-address-label" ,
				"edit-profile-email-address-verification" ,
				"edit-profile-change-password-label" ,
				"edit-profile-change-password-input" ,
				"edit-profile-email-address-input",
				"edit-profile-change-email-input-again" ,
				"edit-profile-retrieve-email-password-reset" ,
				"edit-profile-date-of-birth" ,
				"edit-profile-security-question-label" ,
				"edit-profile-security-question-input" ,
				"edit-profile-email-reminder" ,
				"edit-profile-email-reminder-three-day",
				"edit-profile-email-reminder-input" ,
				"edit-profile-noemail-input" ,
				"edit-profile-change-your-spacer" ,
				"edit-profile-change-password-label-spacer-top" ,
				"edit-profile-change-your-spacer-dotted" ,
				"edit-profile-change-your-spacer-bottom" ,
				"edit-profile-change-email-input-again-spacer" ,
				"edit-profile-change-email-input-again-spacer-dotted" ,
				"edit-profile-retrieve-email-password-reset-spacer-top" ,
				"edit-profile-email-address-verification" ,
				"edit-profile-email-address-verification-spacer" ,
				"edit-profile-email-address-verification-spacer-dotted" ,
				"edit-profile-retrieve-email-password-reset-spacer" ,
				"edit-profile-date-of-birth-spacer-top" ,
				"edit-profile-date-of-birth-spacer" ,
				"edit-profile-security-question-input-spacer-top" ,
				"edit-profile-security-question-input-spacer" ,
				"edit-profile-security-question-input-spacer-dotted"
			]
		}
	}
});