<?php

namespace App\Support;

use DOMDocument;
use DOMElement;
use DOMNode;

/**
 * Strips any tag/attribute not on the allow-list so rich-text editor output
 * (TipTap) can be stored and rendered without exposing script/style/event-handler XSS.
 */
class HtmlSanitizer
{
    private const ALLOWED_TAGS = [
        'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 's', 'u', 'code', 'pre',
        'h1', 'h2', 'h3', 'h4', 'blockquote',
        'ul', 'ol', 'li',
        'a',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ];

    private const ALLOWED_ATTRIBUTES = [
        'a' => ['href', 'target', 'rel'],
    ];

    public static function clean(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return $html;
        }

        $document = new DOMDocument;
        libxml_use_internal_errors(true);
        $document->loadHTML(
            '<?xml encoding="utf-8"?><div id="__root__">'.$html.'</div>',
            LIBXML_NOERROR | LIBXML_NOWARNING
        );
        libxml_clear_errors();

        $root = $document->getElementById('__root__');

        if ($root === null) {
            return '';
        }

        static::sanitizeNode($root, $document);

        $output = '';
        foreach (iterator_to_array($root->childNodes) as $child) {
            $output .= $document->saveHTML($child);
        }

        return $output;
    }

    private static function sanitizeNode(DOMNode $node, DOMDocument $document): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if (! $child instanceof DOMElement) {
                if ($child->nodeType !== XML_TEXT_NODE) {
                    $node->removeChild($child);
                }

                continue;
            }

            $tag = strtolower($child->tagName);

            if (! in_array($tag, self::ALLOWED_TAGS, true)) {
                static::sanitizeNode($child, $document);

                while ($child->firstChild) {
                    $node->insertBefore($child->firstChild, $child);
                }

                $node->removeChild($child);

                continue;
            }

            foreach (iterator_to_array($child->attributes ?? []) as $attribute) {
                $allowed = self::ALLOWED_ATTRIBUTES[$tag] ?? [];

                if (! in_array(strtolower($attribute->name), $allowed, true)) {
                    $child->removeAttribute($attribute->name);
                }
            }

            if ($tag === 'a' && $child->hasAttribute('href')) {
                $href = trim($child->getAttribute('href'));

                if (! preg_match('/^(https?:|mailto:|\/)/i', $href)) {
                    $child->removeAttribute('href');
                }

                $child->setAttribute('rel', 'noopener noreferrer nofollow');
                $child->setAttribute('target', '_blank');
            }

            static::sanitizeNode($child, $document);
        }
    }
}
