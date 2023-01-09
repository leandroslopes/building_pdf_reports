(function() {
  /* populate the 'data' object */
  /* e.g., data.table = $sp.getValue('table'); */
	var table_name = 'incident';
	
	data.pdf_url = '';
	data.error_message = '';
	data.attachment_sys_id = '';	
	data.incident_label_fields = [];
	data.incidents = [];
	
	data.incident_label_fields = get_incident_label_fields();
	data.incidents = get_incidents();

	if (input && input.action == 'generate_pdf') {
	
		var pdf_data = {
			title: 'Incident Report',
			incident_labels: get_incident_label_fields(),
			incidents: get_incidents()
		};
		
		generate_report_pdf(pdf_data);
	}
	
	/**
	 * Generates and returns the url of the PDF file, or an error message if the PDF file is not generated.
	 * @param {object} pdfData PDF report data.
	 * @return {string} URL of the PDF file or error message.
	 */
	function generate_report_pdf(pdf_data) {
		var response_generate_pdf = '';
		var is_url_response_generate_pdf = '';
		
		var generate_pdf = new GeneratePDFIncidentReport();
		
		response_generate_pdf = generate_pdf.generate(pdf_data);
		is_url_response_generate_pdf = response_generate_pdf.startsWith('http');
		
		if (response_generate_pdf && is_url_response_generate_pdf)
			data.pdf_url = response_generate_pdf;
		else
			data.error_message = response_generate_pdf;
	}
	
	function get_incident_label_fields() {
		var incident_label_names = [];
		
		var glide_record_incidents = new GlideRecord(table_name);

		glide_record_incidents.setLimit(1);
		glide_record_incidents.query();

		if (glide_record_incidents.next()) {
				incident_label_names.push(glide_record_incidents.number.getLabel());
				incident_label_names.push(glide_record_incidents.opened_at.getLabel());
				incident_label_names.push(glide_record_incidents.short_description.getLabel());
				incident_label_names.push(glide_record_incidents.caller_id.getLabel());
				incident_label_names.push(glide_record_incidents.priority.getLabel());
				incident_label_names.push(glide_record_incidents.state.getLabel());
				incident_label_names.push(glide_record_incidents.category.getLabel());
				incident_label_names.push(glide_record_incidents.assignment_group.getLabel());
				incident_label_names.push(glide_record_incidents.assigned_to.getLabel());
				incident_label_names.push(glide_record_incidents.sys_updated_on.getLabel());
		}
		
		return incident_label_names;
	}
	
	function get_incidents() {
		var incidents = [];
		
		var glide_record_incidents = new GlideRecord(table_name);

    glide_record_incidents.orderByDesc('sys_updated_on');
		glide_record_incidents.query();

		while (glide_record_incidents.next()) {
			
			var incident = {
      	number: glide_record_incidents.number.toString(),
        opened_at: glide_record_incidents.opened_at.toString(),
        short_description: glide_record_incidents.short_description.toString(),
       	caller_name: glide_record_incidents.caller_id.first_name.toString() + ' ' + glide_record_incidents.caller_id.last_name.toString(),
        priority: glide_record_incidents.priority.getDisplayValue().toString(),
        state: glide_record_incidents.state.getDisplayValue().toString(),
       	category: glide_record_incidents.category.getDisplayValue().toString(),
        assignment_group: glide_record_incidents.assignment_group.name.toString(),
        assigned_to_name: glide_record_incidents.assigned_to.first_name.toString() + ' ' + glide_record_incidents.assigned_to.last_name.toString(),
        sys_updated_on: glide_record_incidents.sys_updated_on.toString()
			};
				
      incidents.push(incident);
			
			incident = {};
		}
		
		return incidents;
	}

})();