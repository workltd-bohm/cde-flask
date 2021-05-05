from .information_container import IC


class Directory(IC):

    def __init__(self, dir_id, name, parent_directory, directory_history, path, parent_id, color, comments, tags,
            sub_folders, access):
        super().__init__(dir_id, name, parent_directory, directory_history, path, parent_id, color, comments, tags,
                         sub_folders, access)

