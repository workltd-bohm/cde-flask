class FileHistory:

    def __init__(self, created_time, modified_time, user):
        self._created_time = created_time
        self._modified_time = modified_time
        self._user = user

    @property
    def created_time(self):
        return self._created_time

    @created_time.setter
    def created_time(self, value):
        self._created_time = value

    @property
    def modified_time(self):
        return self._modified_time

    @modified_time.setter
    def modified_time(self, value):
        self._modified_time = value

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        self._user = value
