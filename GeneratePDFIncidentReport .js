var GeneratePDFIncidentReport  = Class.create();
GeneratePDFIncidentReport .prototype = {
    initialize: function() {
    },

	/**
     * Create a name for the PDF file.
	 * @param {object} pdf_data Object with data from the PDF file.
	 * @return {string} pdf_url PDF URL.
     */
    generate: function(pdf_data) {
        var meta_tags = '';
		var css = '';
		var header = '';
		var body = '';
		var body_data = '';
		var incident_labels = [];
		var incidents = [];
		var pdf_url = '';
		var has_report_temp = false;
		var deleted_report_temp = false;
		var no_generate_pdf = '';
		var no_add_report_temp = '';
		
		var pdf_config = {
			html: '',
			table_target: 'u_report_temp',
			sys_id_target: '',
			pdf_name: this.create_pdf_name(),
			header_footer_info: {
				PageSize: 'A4 ',
				PageOrientation: 'LANDSCAPE',
				GeneratePageNumber: 'false',
				TopOrBottomMargin: '16',
				LeftOrRightMargin: '16'
			},
			sys_id_font_family: '09d73ac9c317911038641c5ce001311d' //sys_id of a font family record on the 'sys_pdf_generation_font_family' table
		};
		
        meta_tags = this.create_metatags(pdf_data.title);
		
		css = this.create_css();
		
		header = this.create_header();
		
		incident_labels = pdf_data.incident_labels;
		incidents = pdf_data.incidents;
		
		body = this.create_body(incident_labels);
		
		body_data = this.create_body_data(incidents);
		
		pdf_config.html = meta_tags + css + header + body + body_data;
		
		has_report_temp = this.has_report_temp(pdf_config);
		
		if (has_report_temp) {
			deleted_report_temp = this.delete_report_Temp(pdf_config);
			
			if (deleted_report_temp) {
				pdf_config.sys_id_target = this.add_report_temp(pdf_config);

				if (pdf_config.sys_id_target && pdf_config.sys_id_target !== '') {
					pdf = this.convert_html_to_pdf(pdf_config);

					if (pdf && pdf.attachment_id !== '') {
						pdf_url = this.create_pdf_url_to_download(pdf.attachment_id);

						return pdf_url;
					} else {
						no_generate_pdf = 'Não foi possível gerar o relatório!';

						return no_generate_pdf;
					}


				} else {
					no_add_report_temp = 'Não foi possível gerar o relatório, por não ter sido adicionado o registro na tabela <Report Temp>';

					return no_add_report_temp;
				}

			} else {
				var no_deleted_report_temp = 'Não foi possível gerar o relatório, por não ter sido possível excluir o registro anterior na tabela <Report Temp>';

				return no_deleted_report_temp;
			}
			
		} else {
			pdf_config.sys_id_target = this.add_report_temp(pdf_config);

			if (pdf_config.sys_id_target && pdf_config.sys_id_target !== '') {
				pdf = this.convert_html_to_pdf(pdf_config);

				if (pdf && pdf.attachment_id !== '') {
					pdf_url = this.create_pdf_url_to_download(pdf.attachment_id);

					return pdf_url;
				} else {
					no_generate_pdf = 'Não foi possível gerar o relatório!';

					return no_generate_pdf;
				}
			} else {
				no_add_report_temp = 'Não foi possível gerar o relatório, por não ter sido adicionado o registro na tabela <Report Temp>';

				return no_add_report_temp;
			}
		}
    },
	
	/**
	* Check if there is a record in the Report Temp table with the specified name.
	* @param {object} pdf_config PDF configuration
	* @return {booelan} has_report_temp True if it has a record. False if it doesn't
	*/
	has_report_temp: function(pdf_config) {
		var pdf_name = pdf_config.pdf_name;
		var has_report_temp = false;
		
		var glide_record = new GlideRecord(pdf_config.table_target);

		glide_record.addQuery("u_name", pdf_name);
		glide_record.query();
		
		if (glide_record.next()) {
			has_report_temp = true;
		}
		
		return has_report_temp;
	},

    /**
     * Create a name for the PDF file.
     * @return {string} pdf_name Name for the PDF file.
     */
    create_pdf_name: function() {
        var pdf_name = '';

        pdf_name = 'incident_report_' + gs.getUserID();

        return pdf_name;
    },

    /**
     * Create the initial HTML to convert to PDF.
     * @param {string} title The title of the HTML page.
     * @return {string} meta_tags Beginning of the HTML page.
     */
    create_metatags: function(page_html_title) {
        var meta_tags = '';

        meta_tags = '<!DOCTYPE html><html lang="en">' + 
			'<head>' + 
            '<meta charset="UTF-8" />' + 
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />' + 
            '<title>' + page_html_title + '</title>';

        return meta_tags;
    },

    /**
     * Creates the page CSS.
	 * @return {string} css Page CSS.
     */
    create_css: function() {
        var css = '';

        css = '<style>' + 
            '@page { size: A4 landscape; margin-left: 1cm; margin-top: 4cm; margin-right: 1cm; margin-bottom: 1cm;' + 
            '@top-center { font-family: Roboto, sans-serif; font-size: 12px; content: element(page-header); }' +
			'}' +
			'.page-header { position: running(page-header) }' +
			'.current-page-number:after { content: counter(page) " de " counter(pages); }' +
			
            '.page-header { border-bottom: 0px !important; padding-bottom: 0px !important; }' +
            '.page-header, .page-body { font-family: Roboto; }' +
			'.page-body { font-size: 12px; } ' +
			'table { border-collapse: collapse; border-spacing: 0; font-size: 12px; font-weight: 600; }' +
            '.table-header { border: 2px solid rgb(0, 0, 0); box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;}' +
			'.logo { margin-left: -102px; margin-bottom: -5px; }' +
			'.title { padding: 25px; margin-left: 190px; font-size: 16px !important; }' +
			'.table-filters { padding: 6px; margin-top: 20px; border-top: 2px solid #000; border-bottom: 2px solid #000; font-weight: 600; text-align: center; }' +
            'table.table-data thead tr th { padding: 10px 6px; background-color: #C1C1C1; border-left: 2px solid #C1C1C1; border-right: 2px solid #C1C1C1; text-align: center;  font-weight: bold; color: #000; border: 2px solid #000; }' +
            'table.table-data tbody tr td { padding: 10px 6px; text-align: center; border: 2px solid #000; }' +
			'.table-data { border: 0px; }' +
            '.table-data-title-1, .table-data-title-2 { color: #FFF !important; }' +
			'.table-data-title-1 { background-color: #3075B4 !important; border-left: 2px solid #3075B4 !important; border-right: 2px solid #3075B4 !important; }' +
			'.table-data-title-2 { background-color: #3298FD !important; border-left: 2px solid #3298FD !important; border-right: 2px solid #3298FD !important; }' +
			'table-data-total { border: 2px solid #000; }' +
			'.font-bold { font-weight: bold; }' +
			'.full-width { width: 100%; }' +
			'.flex { display: flex; }' +
			'.flex-1 { flex: 1 }' +
			'.flex-2 { flex: 2 }' +
			'.left { text-align: left; }' +
			'.no-border { border: 0px !important; }' +
			'</style></head><body>';
		
		return css;
    },
	
	/**
	 * Creates the date and time of issue.
	 * @return {object} issue Date and time of issue.
	 */
	create_date_hour_issue: function() {
		var issue = {
			date: '',
			hour: ''
		};
		
		var glideDateTime = new GlideDateTime();
		
        getTime = glideDateTime.getTime();
		
		issue.date = glideDateTime.getDate().getByFormat('dd/MM/YYYY');
		issue.hour = getTime.getByFormat('hh:mm:ss');
		
		return issue;
	},
	
	/**
	 * Create the report header.
	 * @param {object} pdf_data Object with data from the PDF file.
	 * @return {string} header Report header.
	 */
	create_header: function() {
		var header = '';
		
		var issue = this.create_date_hour_issue();
		
		header = '<div class="page-header">' +
			'<div class="table-header flex">' +
			'<div class="logo flex-1"><img src="logo_sn.png" width="110" height="110"/></div>' +
			'<div class="title flex-2">' +
			'<div class="flex"><div class="font-bold left">Incident Report</div></div>' +
			'<div class="flex"><div class="flex-1 left"><strong>Issue: </strong>' + issue.date  + ' ' + issue.hour  + '</div></div>' +
			'<div class="flex"><div class="flex-1 left"><strong>Page: </strong><span class="current-page-number"></span></div></div>' +
			'</div>' +
			'</div>' +
			'</div>';
		
		return header;
	},
	
	/**
	 * Create the report body.
	 * @return {string} body Report body.
	 */
	create_body: function(incident_labels) {
		var body = '';
		
		body = '<div class="page-body">' +
			'<table class="table-data" width="100%">' +
			'<thead>';
		
		body += '<tr>';
		for (var label in incident_labels) {
			body += '<th>' + incident_labels[label] + '</th>';
		}
		body += '</tr>';
		
		body += '</thead>';
		body += '<tbody>';
		
		return body;
	},
	
	/**
	 * Creates the data for the body of the report.
	 * @param {array} titulosPublicosParameter Array of 'Public Titles' objects.
	 * @return {string} body_data Data for the body of the report.
	 */
	create_body_data: function(incidents) { gs.info('leandro' + JSON.stringify(incidents));
		var body_data = '';
		var self  = this;
		
		incidents.forEach(function(incident) {
			
			body_data += '<tr>';
			for (var property in incident) {
				body_data += '<td>' + incident[property] + '</td>';
			}
			body_data += '</tr>';
		});
		
		body_data += '</tbody></table></div></body></html>';
		
		return body_data;
	},
	
	/**
	 * Format a number in the USA standard to the BRL standard.
	 * @param {decimal} number Number to be formatted.
	 * @return {string} numberFormatted Formatted number.
	 */
	formatter_number_to_brl: function(number) {
		var number_formatted = number;
		
		number_formatted = number_formatted.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];

		if (number_formatted.length >= 0 ) {
			var number_formatted_aux = number_formatted.replace(/\./g,",");
			number_formatted = number_formatted_aux.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
		}
		
		return number_formatted;
	},
	
	/**
	 * Deletes a record from the 'Report Temp' table and consequently the associated attachment record in the 'sys_attachment' table.
	 * @param {object} pdf_config PDF attachment settings.
	 * @return {void}
	 */
	delete_report_Temp: function(pdf_config) {
		var pdf_name = pdf_config.pdf_name;
		var deleted = false;
		
		var glide_record = new GlideRecord(pdf_config.table_target);
		
		glide_record.addQuery("u_name", pdf_name);
		glide_record.query();
		
		if (glide_record.next()) {
			deleted = glide_record.deleteRecord();
		}
		
		return deleted;
	},
	
	/**
	 * Adds a record in the 'Report Temp' table.
	 * @param {object} pdf_config PDF attachment settings.
	 * @return {string} reportTempSysID Sys ID of a Report Temp.
	 */
	add_report_temp: function (pdf_config) {
		var report_temp_sys_id = '';
		
		var glide_record = new GlideRecord(pdf_config.table_target);
		
		glide_record.initialize();
		
		glide_record.u_name = pdf_config.pdf_name;

		report_temp_sys_id = glide_record.insert();
		
		return report_temp_sys_id;
	},
	
	/**
	 * Convert HTML to PDF.
	 * @param {object} pdf_config PDF attachment settings.
	 * @return {object} pdf Object with information from the created PDF.
	 */
	convert_html_to_pdf: function(pdf_config) {
		var pdf_generation_api = new sn_pdfgeneratorutils.PDFGenerationAPI();
		
		var pdf = pdf_generation_api.convertToPDFWithHeaderFooter(
            pdf_config.html, 
            pdf_config.table_target, 
            pdf_config.sys_id_target, 
            pdf_config.pdf_name, 
            pdf_config.header_footer_info,
			pdf_config.sys_id_font_family
        );
		
		gs.info(JSON.stringify(pdf));
		
		return pdf;
	},
	
	/**
	 * Creates the URL of the PDF for download.
	 * @param {string} attachmentSysID Sys Attachment ID.
	 * @return {string} attachmentUrl Attachment URL.
	 */
	create_pdf_url_to_download: function(attachment_sys_id) {
		var instace = 'https://' + gs.getProperty('instance_name') + '.service-now.com/';
		var attachment_table = 'sys_attachment.do';
		var attachment_param_sys_id = '?sys_id=' + attachment_sys_id;
		var attachment_url = instace + attachment_table + attachment_param_sys_id;
		
		return attachment_url;
	},

    type: 'GeneratePDFIncidentReport '
};