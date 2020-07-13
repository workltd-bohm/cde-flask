using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace FileNumberingPrototype
{
    public static class Utility
    {

        

        public static string GetFilePathXlsx(string title)
        {            
            OpenFileDialog  openFileDialog = new OpenFileDialog();

            openFileDialog.Title = title;
            openFileDialog.Filter              = "Excel Files | *.xlsx";
            openFileDialog.DefaultExt          = "xlsx";
            openFileDialog.RestoreDirectory    = true;
            //test         
            

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                return openFileDialog.FileName;
            }
            else
                return "";
        }

        public static string GetFilePath(string title, out string FileName, out string Extension)
        {            
            OpenFileDialog  openFileDialog = new OpenFileDialog();

            openFileDialog.Title = title;
            openFileDialog.Filter              = "All files (*.*)|*.*";          
            openFileDialog.RestoreDirectory    = true;
            //test         
            

            if (openFileDialog.ShowDialog() == DialogResult.OK)
            {
                Extension = Path.GetExtension(openFileDialog.FileName);
                FileName = Path.GetFileName(openFileDialog.FileName);

                return openFileDialog.FileName;
            }
            else
            {
                Extension = "";
                FileName = "";
                return "";
            }
                
        }
    }
}
