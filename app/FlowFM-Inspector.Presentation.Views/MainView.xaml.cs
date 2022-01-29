using System;
using MahApps.Metro.Controls;
using Microsoft.Web.WebView2.Core;

namespace FlowFM_Inspector.Presentation.Views
{
    /// <summary>
    /// <see cref="MainView"/> defines the main window of the FlowFM Inspector app.
    /// </summary>
    public partial class MainView : MetroWindow
    {
        private const string AppName = "flowfm-inspector";

        /// <summary>
        /// Constructs a new <see cref="MainView"/>.
        /// </summary>
        public MainView()
        {
            InitializeComponent();
            WebView.CoreWebView2InitializationCompleted += 
                OnWebViewOnCoreWebView2InitializationCompleted;
            WebView.Source = new Uri($"https://{AppName}/ui/index.html");
        }

        private void OnWebViewOnCoreWebView2InitializationCompleted(
            object? sender,
            CoreWebView2InitializationCompletedEventArgs e)
        {
            if (e.IsSuccess) LoadWebApp();
        }


        private void LoadWebApp()
        {
            WebView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                hostName: AppName,
                folderPath: "",
                accessKind: CoreWebView2HostResourceAccessKind.Allow);
        }
    }
}
