from .information_container import IC


class Directory(IC):

    def __init__(self, dir_id, name, parent_directory, directory_history, path, sub_folders):
        super().__init__(dir_id, name, parent_directory, directory_history, path, sub_folders)


