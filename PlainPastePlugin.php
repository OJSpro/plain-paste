<?php

namespace APP\plugins\generic\plainPaste;

use PKP\plugins\GenericPlugin;
use PKP\plugins\Hook;
use APP\template\TemplateManager;
use APP\core\Application;

class PlainPastePlugin extends GenericPlugin
{
    /**
     * @copydoc Plugin::register()
     */
    public function register($category, $path, $mainContextId = null)
    {
        if (parent::register($category, $path, $mainContextId)) {
            if ($this->getEnabled()) {
                Hook::add('TemplateManager::display', [$this, 'injectJS']);
                Hook::add('TemplateManager::setupBackendPage', [$this, 'injectJS']);
            }
            return true;
        }
        return false;
    }

    /**
     * Inject the plainPaste.js script into the template manager
     *
     * @param string $hookName
     * @param array $args [TemplateManager, template]
     */
    public function injectJS($hookName, $args)
    {
        $templateMgr = $args[0];
        $request = Application::get()->getRequest();

        $baseUrl = $request->getBaseUrl();
        $jsUrl = $baseUrl . '/' . $this->getPluginPath() . '/js/plainPaste.js';

        // Add the script to both frontend and backend
        $templateMgr->addJavaScript(
            'plainPaste',
            $jsUrl,
            [
                'contexts' => ['backend', 'frontend'],
                'priority' => STYLE_SEQUENCE_LAST // Ensure it loads after TinyMCE
            ]
        );

        return false;
    }

    /**
     * @copydoc Plugin::getDisplayName()
     */
    public function getDisplayName()
    {
        return 'Plain Paste for TinyMCE';
    }

    /**
     * @copydoc Plugin::getDescription()
     */
    public function getDescription()
    {
        return 'Automatically clears all formatting from pasted content in all TinyMCE editors sitewide.';
    }
}
