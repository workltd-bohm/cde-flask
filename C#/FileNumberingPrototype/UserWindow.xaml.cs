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
using System.Windows.Shapes;

namespace FileNumberingPrototype
{
    /// <summary>
    /// Interaction logic for UserWindow.xaml
    /// </summary>
    public partial class UserWindow : Window
    {
        public User internaluser { get; set;}


        public UserWindow(SLLists sll, User user)
        {
            InitializeComponent();

            internaluser = new User(true);

            if(sll.Role != null)
            {
                cb_Role.ItemsSource     = sll.Role; 
            }     
            
            e_Name.Text = user.Name;
            e_ProjectCode.Text = user.Project.Key;
            e_ProjectName.Text = user.Project.Value;
            e_CompanyCode.Text = user.Company.Key;
            e_CompanyName.Text = user.Company.Value;



        }

        private void OkClick(object sender, RoutedEventArgs e)
        {
            internaluser.Name           = e_Name.Text;
            internaluser.Project        =  new KeyValuePair<string, string>(e_ProjectCode.Text,e_ProjectName.Text) ;
            internaluser.Company        =  new KeyValuePair<string, string>(e_CompanyCode.Text,e_CompanyName.Text) ;
            if(cb_Role.SelectedItem != null)
            {
                internaluser.Role           =  (KeyValuePair<string, string>)    cb_Role.SelectedItem;  
            }
            


            this.Close();
        }
    }
}
