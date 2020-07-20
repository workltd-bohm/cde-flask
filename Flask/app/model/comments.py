class Comments:

    def __init__(self, file_id, user_id, time, comment):
        self._file_id = file_id
        self._user_id = user_id
        self._time = time
        self._comment = comment

    @property
    def file_id(self):
        return self._file_id

    @file_id.setter
    def file_id(self, value):
        self._file_id = value

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        self._user_id = value

    @property
    def time(self):
        return self._time

    @time.setter
    def time(self, value):
        self._time = value

    @property
    def comment(self):
        return self._comment

    @comment.setter
    def comment(self, value):
        self._comment = value
