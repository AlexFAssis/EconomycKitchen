/*!
 * Start Bootstrap - SB Admin v4.0.0-beta.2 (https://startbootstrap.com/template-overviews/sb-admin)
 * Copyright 2013-2017 Start Bootstrap
 * Licensed under MIT (https://github.com/BlackrockDigital/startbootstrap-sb-admin/blob/master/LICENSE)
 */
// $(document).ready(function(){$("#dataTable").DataTable()});

$(document).ready(function () {
  $('#dataTable').DataTable({
    "order": [[1, "desc"]], //or asc 
    "columnDefs": [{ "targets": 1, "type": "date-eu" }],
  });
});



