api.controller=function($scope, $window, $location) {
  /* widget controller */
  var c = this;
	
	c.title = 'Incident Report';
	c.incident_label_fields = [];
	c.incidents = [];
	c.attachment_sys_id = '';
	c.issue_date = '';
	c.issue_hour = '';
	
	get_date_hour_issue();
	
	c.incident_label_fields = c.data.incident_label_fields;
	c.incidents = organize_incidents(c.data.incidents);
	
	/*  
	 * Set date and time when the report is issued.
	 */
	function get_date_hour_issue() {
		c.issue_date = moment().format("DD/MM/YYYY");
		c.issue_hour = moment().format("HH:mm:ss");
	}
	
	function organize_incidents(incidents) {
		var incidents_organized = incidents;
		
		incidents_organized.map(function(incident) {
			return {
				number: incident.number,
				opened_at: incident.opened_at,
        short_description: incident.short_description,
       	caller_name: incident.caller_name,
        priority: incident.priority,
        state: incident.state,
       	category: incident.category,
        assignment_group: incident.assignment_group,
        assigned_to_name: incident.assigned_to_name,
        sys_updated_on: incident.sys_updated_on
			}
		});
		
		return incidents_organized;
	}

	/* 
	 * Generate PDF report.
	 */
	c.generate_pdf = function() {
		var attachment_url = '';
		var error_message = '';
		
		var obj = {
			action: 'generate_pdf',
		};

		c.server.get(obj).then(function(response) {
			c.data.action = undefined;
			
			if (response.data.pdf_url && response.data.pdf_url !== '') {
				attachment_url = response.data.pdf_url;				
				$window.open(attachment_url, '_self');
			} else {
				error_message = response.data.error_message;
				alert(error_message);
			}
		});
	}
};