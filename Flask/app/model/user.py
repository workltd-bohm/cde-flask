class User:

    def __init__(self):
        self._username = ""
        self._email = ""
        self._password = ""
        self._id = ""
        self._confirmed = False
        self._picture = ""
        self._company_code = ""
        self._company_name = ""
        self._company_role = ""

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
    def confirmed(self):
        return self._confirmed

    @confirmed.setter
    def confirmed(self, value):
        self._confirmed = value

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

    @property
    def picture(self):
        return self._picture

    @picture.setter
    def picture(self, value):
        self._picture = value

    @property
    def company_code(self):
        return self._company_code

    @company_code.setter
    def company_code(self, value):
        self._company_code = value

    @property
    def company_name(self):
        return self._company_name

    @company_name.setter
    def company_name(self, value):
        self._company_name = value

    @property
    def company_role(self):
        return self._company_role

    @company_role.setter
    def company_role(self, value):
        self._company_role = value

    def to_json(self):
        return {
                    'id': self._id,
                    'username': self._username,
                    'email': self._email,
                    'password': self._password,
                    'confirmed': self._confirmed
                }
