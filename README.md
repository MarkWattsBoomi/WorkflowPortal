#   THIS MODULE IS FLUID - THERE FREQUENT ADDITIONS, EXPANSIONS AND FIXES

This module has several elements to it: -

#   FlowComponentModel
The flow component model is a class library for typescript which provides an object model for building Flow custom components.

##  FlowComponent
This is very much like the normal mode where we replace a single page component with a shiny new react one and use the model and state etc.
If you base your own class on a FlowComponent then you have access to the flow's outcomes, attributes (page level & component level), model and state.  This will not, by default get the entire set of fields from the state unless you call the async getValues() method.

##  FlowPage
This is where we want to take over the whole page, our page in flow will most likely only contain a single component which will be complex and only really interact with flow to set values, trigger outcomes etc and all the real grunt work will be handled in our code.
This will, by default get everything from flow, all the values, the user details, outcomes, attributes, everything

##  FlowBaseComponent
Do not base your component on this, use the two above.
The FlowBaseComponent root class implements all the functionality for getting & setting values (any value) in the flow, for getting attributes and getting & triggering outcomes, it gets the properties of the component for you and handles all the underlying network goings-on.


#   UI Components

#   NavigationMenu
This is a top of page nav bar 80px high which allows the specification of an icon (top left), a title and sub title, a user avatar + name and role text and a configurable set of menu items.

![alt text](https://files-manywho-com.s3.amazonaws.com/bf9c8481-0fbe-4240-941d-8d928744ba4d/NavigationMenu.png)

The user element shows an icon for the user and their name, the user name is gotten from flow and that, if specified, maps to a png file in assets with the same file name e.g. username=fred.bloggs graphic should be fred.bloggs.png

The menu items are configured using a list in flow and can be displayed as icons with tool tips or text.  They support child items as a drop down.  

Each one can be a LINK, TAB, OUTCOME or MENU

```
LINK will redirect the current browser to another Uri page.
TAB will open the Uri in a new tab
OUTCOME will trigger the specified outcome
MENU allows specifying the name of a list (int the value field) which contains other MenuItems to form a child dropdown menu.
```

There is also an exit button top right which closes the tab.

The exact function of each menu item is defined in the pre-requisite MenuItem type: -

```
MenuItem{
    label       string  the display text for the item, the caption
    value       string  the value used when this menu item is triggered e.g. the name of the outcome to trigger 
                        or the Uri to open in a new tab etc.
    icon        string  the bootstrap glyphicon to display, just the short name without the "glyphicon-" part e.g. envelope or wrench.  
                        if not specifed then it shows the label, this controls if it's an icon or text menu item
    type        string  the action type LINK, TAB, OUTCOME, MENU
    name        string  the internal name of the menu, not really used
    order       number  the display order or position from 1-99 allowing you to define the order the menu items are shown
    subItems    list    a list of child MenuItem objects to use for nested dropdown.
}
```

So create the MenuItem type and then a list of them and set the values.

Drop a component on your page, change its componentType to NavigationMenu, set its DataSource to your MenuItem list and add these attributes: -

```
logo                    string      the full url to the graphic you want for the top left icon.  
                                    you could store the logo graphic in assets for ease.
title                   string      the title bar title label
sub-title               string      some smaller text to show under the title label
hide-user-anonymous     boolean     true to completely hide the user details if in anonymous mode i.e. flow doesn't use authentication, false
```

#   Footer
The Footer component shows a simple bar at the bottom of the page in which you can set a single string of text to be shown centered in the page.

![alt text](https://files-manywho-com.s3.amazonaws.com/bf9c8481-0fbe-4240-941d-8d928744ba4d/Footer.png)

Drop a component on your page, change its componentType to Footer, set its DataSource to your MenuItem list and add these attributes: -

```
Title                   string      the text to be displayed in the footer.
```

#   ClientArea
The clientArea component is essentially an iFrame which will populate the area between the NavigationMenu and the Footer

Drop a component on your page, change its componentType to ClientArea, set its state to a string field containing the Uri you want displayed e.g. a fixed URL or most likely the launch uri for another flow.

This will receive posted messages from the NotificationPoster, specifically the OUTCOME one to change the src property of the iFrame.


#   NotificationPoster
This little gadget is used by child flows in the ClientArea to post messages up to the ClientArea to notify events.

In a child flow you simply set attributes on an outcome which specify the message to be sent up: -

```
NotifyParent        boolean     true if messages should be sent or false if not
NotifyParentAction  string      OUTCOME or anything you want.  
                                if OUTCOME then the NotifyParentData is the outcome name in the parent flow to trigger.
                                anything else and you need to implement a function async handleMessage(msg: any) { } to handle it.
NotifyParentData    string      the name of an outcome or whatever you want to pass to your own handler.
```



#   WorkQueues
This is an implementation of work queue tree, work item list and work item viewer, ask me about it.