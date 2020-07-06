using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Here we just store all the lists
    /// </summary>
    public class SLLists
    {
        public List<KeyValuePair<string, string>>   VolumeSystem    { get; set;}
        public List<KeyValuePair<string, string>>   Level           { get; set;}
        public List<KeyValuePair<string, string>>   Type            { get; set;}
        public List<KeyValuePair<int, string>>      FileNumber      { get; set;}
        public List<KeyValuePair<string, string>>   Status          { get; set;}
        public List<KeyValuePair<string, string>>   Revision        { get; set;}
        public List<KeyValuePair<string, string>>   Uniclass2015    { get; set;}
        public List<KeyValuePair<string, string>>   Name            { get; set;}

        public List<KeyValuePair<string, string>>   Role            { get; set;}

        public SLLists()
        {
            InitializeSLLists();
        }

        private void InitializeSLLists()
        {
            InitializeVolumeSystem    ();
            InitializeLevel           ();
            InitializeType            ();
            InitializeFileNumber      ();
            InitializeStatus          ();
            InitializeRevision        ();
            InitializeUniclass2015    ();
            InitializeName            ();

            InitializeRole    ();
           
        }

        private void InitializeRole()
        {
            Role = new List<KeyValuePair<string, string>>();
        }

        private void InitializeVolumeSystem()
        {
            VolumeSystem = new List<KeyValuePair<string, string>>();
        }

        private void InitializeLevel()
        {
           Level = new List<KeyValuePair<string, string>>();
        }

        private void InitializeType()
        {
           Type = new List<KeyValuePair<string, string>>();
        }
        

        private void InitializeFileNumber()
        {
            FileNumber = new List<KeyValuePair<int, string>>();
        }
        

        private void InitializeStatus()
        {
             Status = new List<KeyValuePair<string, string>>();  
        }

        private void InitializeRevision()
        {
           Revision = new List<KeyValuePair<string, string>>(); 
        }

        private void InitializeUniclass2015()
        {
            Uniclass2015 = new List<KeyValuePair<string, string>>();
        }

        private void InitializeName()
        {
            Name = new List<KeyValuePair<string, string>>();
        }
    }
}
