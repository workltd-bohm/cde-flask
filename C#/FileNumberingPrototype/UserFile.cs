﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileNumberingPrototype
{
    public class UserFile
    {
        public  string                              OriginalName        { get; set; }  
        public  string                                NewName             { get; set; } 
        public  DateTime                            LastUploaded        { get; set; } 
        public  User                                LastUser            { get; set; } 

        public  string                              OriginalNameFullPath{ get; set; } 
        public  string                              NewNameFullPath{ get; set; } 

        public  string                              DirPath{ get; set; } 

        public UserFile(string originalName)
        {
            OriginalName = originalName; //"RRK-WRK-00-01-DR-1-1000-S1-P1_DRAWING_NAME.PDF";
        }

        private void UpdateName()
        {
            //The name consists of follwoing strings
            string sProject, sCompany, sVolumeSystem, sLevel, sType, sRole, sNumber, sStatus, sRevision, sName, sExtension; 

        }
    }
}
