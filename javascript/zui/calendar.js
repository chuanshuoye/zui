define("zui/calendar",["zui/base","zui/calendar/calendar","zui/calendar/datepicker","zui/calendar/datecalendar"],function(require,exports,modules){

		var Calendar={
			Calendar:require("zui/calendar/calendar"),
			DatePicker:require("zui/calendar/datepicker"),
			DateCalendar:require("zui/calendar/datecalendar")
		}

		return Calendar;

});