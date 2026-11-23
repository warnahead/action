(function () {
  'use strict';
  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }
  var now = new Date();
  var today = now.getFullYear() + '-' + pad(now.getMonth() + 1) + '-' + pad(now.getDate());
  function utc(iso) {
    return Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
  }
  function plural(n) {
    return n + (n === 1 ? ' day' : ' days');
  }
  function daysText(effective, precision) {
    var n = Math.round((utc(effective) - utc(today)) / 86400000);
    var text = n === 0 ? 'Today' : n > 0 ? plural(n) : plural(-n) + ' ago';
    return precision === 'day' ? text : 'About ' + text.toLowerCase();
  }
  Array.prototype.slice.call(document.querySelectorAll('[data-days]')).forEach(function (cell) {
    cell.textContent = daysText(cell.getAttribute('data-days'), cell.getAttribute('data-precision'));
  });
  Array.prototype.slice.call(document.querySelectorAll('[data-asof]')).forEach(function (note) {
    note.textContent = 'Days are counted from today, ' + today + '.';
  });
  var form = document.getElementById('filters');
  if (!form) return;
  var table = document.getElementById(form.getAttribute('data-table') || '');
  var count = document.getElementById('filter-count');
  if (!table) return;
  var rows = Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-effective]'));
  var groups = Array.prototype.slice.call(table.querySelectorAll('tbody tr[data-group]'));
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
    groups.forEach(function (head) {
      head.hidden = !rows.some(function (row) {
        return row.parentNode === head.parentNode && !row.hidden;
      });
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
