class Details:

    def __init__(self, event_name, date, event_value=''):
        self._event_name = event_name
        self._date = date
        self._event_value = event_value

    @property
    def event_name(self):
        return self._event_name

    @event_name.setter
    def event_name(self, value):
        self._event_name = value

    @property
    def date(self):
        return self._date

    @date.setter
    def date(self, value):
        self._date = value

    @property
    def event_value(self):
        return self._event_value

    @event_value.setter
    def event_value(self, value):
        self._event_value = value

    def to_json(self):
        return {
            'event_name': self._event_name,
            'date': self._date,
            'event_value': self._event_value
        }

    @staticmethod
    def json_to_obj(json_file):
        return Details(json_file['event_name'],
                       json_file['date'],
                       json_file['event_value']
                       )