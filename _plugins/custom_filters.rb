module Jekyll
    module HoverFootnoteFilter
      def hover_footnotes(input)
        input.gsub(/\(\:\:(.*?)\)/, '<span class="hover-footnote" data-title="\1">[*]</span>')
      end
    end
  end
  
  Liquid::Template.register_filter(Jekyll::HoverFootnoteFilter)
  