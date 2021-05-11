class User:

    def __init__(self):
        self._fname = ""
        self._lname = ""
        self._username = ""
        self._email = ""
        self._password = ""
        self._id = ""
        self._confirmed = False
        self._picture = ""
        self._company_code = ""
        self._company_name = ""
        # self._company_role = ""
        self._role_code = ""

    def create_user(self, json_data):
        self._fname = json_data['fname']
        self._lname = json_data['lname']
        self._username = json_data['username']
        self._email = json_data['email']
        self._password = json_data['password']

    def update_user(self, json_data):
        if "fname" in json_data and len(json_data['fname']) > 0: self._fname = json_data['fname']
        if "lname" in json_data and len(json_data['lname']) > 0: self._lname = json_data['lname']
        if "username" in json_data and len(json_data['username']) > 0: self._username = json_data['username']
        if "email" in json_data and len(json_data['email']) > 0: self._email = json_data['email']
        if "password" in json_data and len(json_data['password']) > 0: self._password = json_data['password']
        if "picture" in json_data and len(json_data['picture']) > 0: self._picture = json_data['picture']
        if "company_code" in json_data and len(json_data['company_code']) > 0: self._company_code = json_data['company_code']
        if "company_name" in json_data and len(json_data['company_name']) > 0: self._company_name = json_data['company_name']
        # if "company_role" in json_data and len(json_data['company_role']) > 0: self._company_role = json_data['company_role']
        if "role_code" in json_data and len(json_data['role_code']) > 0: self._role_code = json_data['role_code']

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

    # First Name
    @property
    def fname(self):
        return self._fname

    @fname.setter
    def fname(self, value):
        self._fname = value

    # Last Name
    @property
    def lname(self):
        return self._lname

    @lname.setter
    def lname(self, value):
        self._lname = value

    # User name
    @property
    def username(self):
        return self._username

    @username.setter
    def username(self, value):
        self._username = value

    # Email
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

    # @property
    # def company_role(self):
    #     return self._company_role

    # @company_role.setter
    # def company_role(self, value):
    #     self._company_role = value

    @property
    def role_code(self):
        return self._role_code

    @role_code.setter
    def role_code(self, value):
        self._role_code = value

    def to_json(self):
        return {
                    'id': self._id,
                    'fname': self._fname,
                    'lname': self.lname,
                    'username': self._username,
                    'email': self._email,
                    'password': self._password,
                    'picture': self._picture,
                    'company_code': self._company_code,
                    'company_name': self._company_name,
                    # 'company_role': self._company_role,
                    'confirmed': self._confirmed,
                    'role_code': self._role_code
                }
