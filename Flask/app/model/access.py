from .role import Role

class Access:

    def __init__(self, user, parent_id, ic_id, role, exp_date):
        self._user = user
        self._parent_id = parent_id
        self._ic_id = ic_id
        self._role = role
        self._exp_date = exp_date

    @property
    def user(self):
        return self._user

    @user.setter
    def user(self, value):
        self._user = value

    @property
    def parent_id(self):
        return self._parent_id

    @parent_id.setter
    def parent_id(self, value):
        self._parent_id = value

    @property
    def ic_id(self):
        return self._ic_id

    @ic_id.setter
    def ic_id(self, value):
        self._ic_id = value

    @property
    def role(self):
        return self._role

    @role.setter
    def role(self, value):
        self._role = value

    @property
    def exp_date(self):
        return self._exp_date

    @exp_date.setter
    def exp_date(self, value):
        self._exp_date = value

    def to_json(self):
        return {
            'user': self._user,
            'parent_id': self._parent_id,
            'ic_id': self._ic_id,
            'role': self._role,
            'exp_date': self._exp_date
        }

    @staticmethod
    def json_to_obj(json_file):
        return Access(json_file['user'],
                      json_file['parent_id'],
                      json_file['ic_id'],
                      json_file['role'],
                      json_file['exp_date']
                      )
