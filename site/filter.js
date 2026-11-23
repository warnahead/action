(function () {
  'use strict';
  var form = document.getElementById('filters');
  if (!form) return;
  var table = document.getElementById(form.getAttribute('data-table') || '');
  var count = document.getElementById('filter-count');
  if (!table) return;
  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr'));
  var fields = Array.prototype.slice.call(form.querySelectorAll('input, select'));
  function value(name) {
    var field = form.querySelector('[name="' + name + '"]');
    return field ? String(field.value).trim() : '';
  }
  function apply() {
    var platform = value('platform');
    var status = value('status');
    var from = value('from');
    var to = value('to');
    var text = value('q').toLowerCase();
    var shown = 0;
    rows.forEach(function (row) {
      var date = row.getAttribute('data-effective') || '';
      var match =
        (!platform || row.getAttribute('data-platform') === platform) &&
        (!status || row.getAttribute('data-status') === status) &&
        (!from || date >= from) &&
        (!to || date <= to) &&
        (!text || row.textContent.toLowerCase().indexOf(text) !== -1);
      row.hidden = !match;
      if (match) shown += 1;
    });
    if (count) count.textContent = 'Showing ' + shown + ' of ' + rows.length + ' deadlines';
  }
  fields.forEach(function (field) {
    field.addEventListener('input', apply);
    field.addEventListener('change', apply);
  });
  var clear = form.querySelector('[data-clear]');
  if (clear)
    clear.addEventListener('click', function () {
      fields.forEach(function (field) {
        field.value = '';
      });
      apply();
    });
  form.hidden = false;
  apply();
})();
