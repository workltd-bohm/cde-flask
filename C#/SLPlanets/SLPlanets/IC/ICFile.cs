using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SLPlanets
{
    class ICFile  : IC
    {
        public string originalName  { get; set; }
        public string ISOName       { get; set; }

        //ISO 19650

        public  KeyValuePair<string,string>  ProjectVolumeOrSystem   { get; set; }
        public  KeyValuePair<string,string>  ProjectLevel   { get; set; }
        public  KeyValuePair<string,string>  TypeOfInformation   { get; set; }
        public  KeyValuePair<string,string>  FileNumber   { get; set; }
        public  KeyValuePair<string,string>  Status   { get; set; }
        public  KeyValuePair<string,string>  Revision   { get; set; }
        public  KeyValuePair<string,string>  UniclassCode   { get; set; }
        public  KeyValuePair<string,string>  Name   { get; set; }
        public  KeyValuePair<string,string>  FileExtension   { get; set; }
    }
}
