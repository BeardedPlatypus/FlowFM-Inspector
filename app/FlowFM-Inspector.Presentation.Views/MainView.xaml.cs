using System;
using MahApps.Metro.Controls;
using Microsoft.Web.WebView2.Core;

namespace FlowFM_Inspector.Presentation.Views
{
    public partial class MainView : MetroWindow
    {
        private const string AppName = "flowfm-inspector";

        public MainView()
        {
            InitializeComponent();
            WebView.CoreWebView2InitializationCompleted += 
                OnWebViewOnCoreWebView2InitializationCompleted;
            WebView.Source = new Uri($"https://{AppName}/app/index.html");
        }

        private void OnWebViewOnCoreWebView2InitializationCompleted(
            object? sender,
            CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess) LoadWebApp();
        }


        public void LoadWebApp()
        {
            WebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                hostName: AppName,
                folderPath: "",
                accessKind: CoreWebView2HostResourceAccessKind.Allow);
        }
    }
}
