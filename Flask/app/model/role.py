from enum import Enum


class Role(Enum):
    ADMIN = 0
    WATCHER = 1
    DEVELOPER = 2
    OWNER = 3


class UserRoles:

    def __init__(self, user_id, project_id, role):
        self._user_id = user_id
        self._project_id = project_id
        self._role = role

    @property
    def user_id(self):
        return self._user_id

    @user_id.setter
    def user_id(self, value):
        self._user_id = value

    @property
    def project_id(self):
        return self._project_id

    @project_id.setter
    def project_id(self, value):
        self._project_id = value

    @property
    def role(self):
        return self._role

    @role.setter
    def role(self, value):
        self._role = value

