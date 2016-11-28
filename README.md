# dhbw-mosbach-bot
## API-Calls StuV 
/survival/api.php?action={action}

### getLectures
Parameter: course
Antwort:
````json
[
    {
        "ID":"string",
        "course":"string",
        "name":"string",
        "start_mysql":"yyyy-mm-dd HH:MM:SS",
        "start_date":"dd.mm.yyyy",
        "start_time":"HH:mm",
        "end_mysql":"yyyy-mm-dd HH:MM:SS",
        "end_date":"dd.mm.yyyy",
        "end_time":"HH:mm",
        "duration": <duration in minutes>,
        "today": boolean,
        "over": boolean,
        "allDayEvent": boolean,
        "multipleDayEvent": boolean,
        "lecturer":"string",
        "location":"string",
        "lastModified_mysql":"yyyy-mm-dd HH:MM:SS"
    },
    ...
]
````

### getCourses
Parameter: term: Suchbegriff
Antwort:
````json
[
    "course1",
    "course2"
]
````