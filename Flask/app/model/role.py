from enum import Enum


class Role(Enum):
    ADMIN = 0
    WATCHER = 1
    DEVELOPER = 2
    OWNER = 3


class CompanyRole(Enum):
    ARCHITECT = 'A'
    BUILDING_SURVEYOR = 'B'
    CIVIL_ENGINEER = 'C'
    DRAINAGE_HIGHWAY = 'D'
    ELECTRICAL_ENGINEER = 'E'
    FACILITIES_MANAGER = 'F'
    GEOGRAPHICAL_LAN_SURVEYOR = 'G'
    HEATING_VENTILATOR_DESIGNER = 'H'
    INTERIOR_DESIGNER = 'I'
    CLIENT = 'K'
    LANDSCAPE_ARCHITECT = 'L'
    MECHANICAL_ENGINEER = 'M'
    PUBLIC_HEALTH_ENGINEER = 'P'
    QUANTITY_SURVEYOR = 'Q'
    STRUCTURAL_ENGINEER = 'S'
    TOWN_PLANNER = 'T'
    CONTRACTOR = 'C'
    SUBCONTRACTOR = 'X'
    SPECIALIST_DESIGNER = 'Y'
    GENERAL = 'Z'
    # ...


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

    def to_json(self):
        return {
            'user_id': self._user_id,
            'project_id': self._project_id,
            'role': self._role
        }

    @staticmethod
    def json_to_obj(json_file):
        return UserRoles(json_file['user_id'],
                         json_file['project_id'],
                         json_file['role']
                         )

