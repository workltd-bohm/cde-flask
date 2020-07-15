class User:

    def __init__(self):
        self._username = ""
        self._email = ""
        self._password = ""
        self._id = ""

    def create_user(self, json_data):
        self._username = json_data['username']
        self._email = json_data['email']
        self._password = json_data['password']

    @property
    def id(self):
        return self._id

    @id.setter
    def id(self, value):
        self._id = value

    @property
    def username(self):
        return self._username

    @username.setter
    def username(self, value):
        self._username = value

    @property
    def email(self):
        return self._email

    @email.setter
    def email(self, value):
        self._email = value

    @property
    def password(self):
        return self._password

    @password.setter
    def password(self, value):
        self._password = value

    def to_json(self):
        return {'id': self._id, 'username': self._username, 'email': self._email, 'password': self._password}
