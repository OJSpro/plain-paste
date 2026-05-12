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
        $request = Application::get()->getRequest();
        $templateMgr = $args[0] ?? TemplateManager::getManager($request);

        if (!$templateMgr) {
            return false;
        }

        $baseUrl = $request->getBaseUrl();
        $jsUrl = $baseUrl . '/' . $this->getPluginPath() . '/js/plainPaste.js?v=' . time();

        // Use addHeader for more reliable injection in OJS 3.4 backend
        $templateMgr->addHeader(
            'plainPaste',
            '<script type="text/javascript" src="' . $jsUrl . '"></script>'
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
