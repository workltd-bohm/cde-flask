using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Office.Interop.Excel;
using _Excel = Microsoft.Office.Interop.Excel;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : System.Windows.Window
    {
        //Global Dialog Properties
        public SLLists      slLists     { get; set;}
        public User         user        { get; set;}
        public UserFile     userFile    { get; set;}


        public MainWindow()
        {
            InitializeComponent(); 
            
            slLists = new SLLists();  
            user = new User(true);            
            
        }

        private void UserOnClick(object sender, RoutedEventArgs e)
        {
            UserWindow userWindow = new UserWindow(slLists, user); 
            userWindow.ShowDialog();   
            
            
                            
                user = userWindow.internaluser;   
            
                l_ProjectCode.Content   = user.Project.Key;
                l_CompanyCode.Content   = user.Company.Key;
                l_RoleCode.Content      =   user.Role.Key;

        }

        private void FileOnClick(object sender, RoutedEventArgs e)
        {
            string path = Utility.GetFilePath("Get Any File", out string FileName, out string Extension);

            if(path == "")
            {
                MessageBox.Show("NOTHING SELECTED");
                return;
            }

            l_OriginalName.Content = FileName + Extension;
            l_Extension.Content = Extension;

            userFile = new UserFile(FileName);

            userFile.OriginalName = FileName;
            userFile.OriginalNameFullPath = path;

            userFile.DirPath = System.IO.Path.GetDirectoryName(path) + "\\";      

                
        }


        private void ContentOnClick(object sender, RoutedEventArgs e)
        {
           // MessageBox.Show("Content Dialog");

            string path = Utility.GetFilePathXlsx("Get The Excel File");


            _Application excel = new _Excel.Application();
            Workbook wb = excel.Workbooks.Open(path);
            Worksheet ws= (Worksheet)wb.Worksheets[1];  
            
            Range excelRange = ws.UsedRange;
            int rowCount = excelRange.Rows.Count;
            int colCount = excelRange.Columns.Count;

            //For Every row (we know the structure fill the lists)
            
                int counter = 0;
                //For every second column
                for (int i = 1; i <= colCount; i+=2)
                {                     
                    for (int j = 2; j <= rowCount; j++)
                    {
                        string cellValue1 = "";
                        string cellValue2 = "";
                        
                            Range range1 = (ws.Cells[j, i] as Range);
                            Range range2 = (ws.Cells[j, i+1 ] as Range);

                            if(range1.Value == null || range2.Value == null)
                                break;
                            else
                            {                               
                                cellValue1 = range1.Value.ToString();
                                cellValue2 = range2.Value.ToString();

                                AddCellToSLList(i, cellValue1, cellValue2);

                                if(i == 1)
                                        counter++;
                                
                            }  
                            
                            
                    }                  
                }            
          

            wb.Close(false, null, null);
            excel.Quit();

            cb_VolumeSystem.ItemsSource     = slLists.VolumeSystem; 
            cb_Level.ItemsSource            = slLists.Level; 
            cb_Type.ItemsSource             = slLists.Type; 
            cb_FileNumber.ItemsSource       = slLists.FileNumber; 
            cb_Status.ItemsSource           = slLists.Status; 
            cb_Revision.ItemsSource         = slLists.Revision; 
            
        }

        private void AddCellToSLList(int column, string cellValue1, string cellValue2)
        {           
            if(column == 1)            
                slLists.VolumeSystem.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));                            
            else if(column == 3)
                slLists.Level.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
            else if(column == 5)
                slLists.Type.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
            else if(column == 7)
                slLists.FileNumber.Add(new KeyValuePair<int, string>( Int32.Parse(cellValue1), cellValue2 ));
            else if(column == 9)
                slLists.Status.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
            else if(column == 11)
                slLists.Uniclass2015.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
            else if(column == 13)
                slLists.Revision.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));
            else if(column == 15)
                slLists.Role.Add(new KeyValuePair<string, string>( cellValue1, cellValue2 ));

        }

        private void NameChanged(object sender, TextChangedEventArgs e)
        {
            l_Name.Content = e_Name.Text;
        }
        
        //Every time a selection change we will update its value
        //We are wasteful a bit - calling this regardless of which box changed....but it does matter
        private void Cb_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if(cb_VolumeSystem.SelectedItem != null)
            {
                KeyValuePair<string, string> resVolumeSystem    = (KeyValuePair<string, string>)    cb_VolumeSystem.SelectedItem;
                if(resVolumeSystem.Key != "")              
                    l_VolumeSystem.Content = resVolumeSystem.Key;
            }

            if(cb_Level.SelectedItem != null)
            {
                KeyValuePair<string, string> resLevel           = (KeyValuePair<string, string>)    cb_Level.SelectedItem;
                if(resLevel.Key != "")              
                    l_Level.Content = resLevel.Key;
            }

            if(cb_Type.SelectedItem != null)
            {
                KeyValuePair<string, string> resType            = (KeyValuePair<string, string>)    cb_Type.SelectedItem;
                if(resType.Key != "")              
                    l_Type.Content = resType.Key;
            }

            if(cb_FileNumber.SelectedItem != null)
            {
                KeyValuePair<int, string> resFileNumber         = (KeyValuePair<int, string>)       cb_FileNumber.SelectedItem;
                if(resFileNumber.Key > 0)              
                    l_FileNumber.Content = resFileNumber.Key;
            }

            if(cb_Status.SelectedItem != null)
            {
                KeyValuePair<string, string> resStatus          = (KeyValuePair<string, string>)    cb_Status.SelectedItem;
                if(resStatus.Key != "")              
                    l_Status.Content = resStatus.Key;
            }

            if(cb_Revision.SelectedItem != null)
            {
                KeyValuePair<string, string> resRevision        = (KeyValuePair<string, string>)    cb_Revision.SelectedItem;
                if(resRevision.Key != "")              
                    l_Revision.Content = resRevision.Key;
            }

            l_NewFinalName.Content  =       l_ProjectCode   .Content    +   "-" +
                                            l_CompanyCode   .Content    +   "-" +
                                            l_VolumeSystem  .Content    +   "-" +
                                            l_Level         .Content    +   "-" +
                                            l_Type          .Content    +   "-" +
                                            l_RoleCode      .Content    +   "-" +
                                            l_FileNumber    .Content    +   "-" +
                                            l_Status        .Content    +   "-" +
                                            l_Revision      .Content    +   "-" +
                                            l_Name          .Content    +   "-" +
                                            l_Extension.Content ;

            
        }

        private void UpdateClick(object sender, RoutedEventArgs e)
        {
            l_NewFinalName.Content  =       l_ProjectCode   .Content    +   "-" +
                                            l_CompanyCode   .Content    +   "-" +
                                            l_VolumeSystem  .Content    +   "-" +
                                            l_Level         .Content    +   "-" +
                                            l_Type          .Content    +   "-" +
                                            l_RoleCode      .Content    +   "-" +
                                            l_FileNumber    .Content    +   "-" +
                                            l_Status        .Content    +   "-" +
                                            l_Revision      .Content    +   "-" +
                                            l_Name          .Content    +   
                                            l_Extension.Content ;

            userFile.NewName = (string)l_NewFinalName.Content ;
            userFile.NewNameFullPath = userFile.DirPath + userFile.NewName;            
        }

        private void RenameCloseClick(object sender, RoutedEventArgs e)
        {
            System.IO.File.Move(userFile.OriginalNameFullPath, userFile.NewNameFullPath);

            this.Close();

        }
    }
}
