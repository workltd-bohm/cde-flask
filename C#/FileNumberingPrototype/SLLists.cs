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

           
        }

        private void InitializeVolumeSystem()
        {
            VolumeSystem = new List<KeyValuePair<string, string>>();

            VolumeSystem.Add(new KeyValuePair<string, string>("ZZ", "Multiple volumes/systems"));
            VolumeSystem.Add(new KeyValuePair<string, string>("XX", "No volume/system"));
            VolumeSystem.Add(new KeyValuePair<string, string>("B1", "Building"));
            VolumeSystem.Add(new KeyValuePair<string, string>("S1", "Anthea Hamilton Garden"));
        }

        private void InitializeLevel()
        {
           Level = new List<KeyValuePair<string, string>>();
        }

        private void InitializeType()
        {
           
        }

        private void InitializeFileNumber()
        {
            
        }

        private void InitializeStatus()
        {
            
        }

        private void InitializeRevision()
        {
            
        }

        private void InitializeUniclass2015()
        {
            
        }

        private void InitializeName()
        {
            
        }
    }
}
