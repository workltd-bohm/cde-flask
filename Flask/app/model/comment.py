class Comments:

    def __init__(self, user, comment, date):
        self._user = user
        self._comment = comment
        self._date = date

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        self._user = value

    @property
    def comment(self):
        return self._comment

    @comment.setter
    def comment(self, value):
        self._comment = value

    @property
    def date(self):
        return self._date

    @date.setter
    def date(self, value):
        self._date = value

    def to_json(self):
        return {
            'user': self._user,
            'comment': self._comment,
            'date': self._date
        }

    @staticmethod
    def json_to_obj(json_file):
        return Comments(json_file['user'],
                        json_file['comment'],
                        json_file['date']
                        )
