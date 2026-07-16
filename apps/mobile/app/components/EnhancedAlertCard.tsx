import React from "react"
import { Pressable, View, ViewStyle, TextStyle, Image, ImageStyle } from "react-native"
import { Text } from "./Text"
import { type ThemedStyle } from "@/theme"
import { PoliceNewsItem } from "@/models/PoliceNews"
import { observer } from "mobx-react-lite"
import { useAppTheme } from "@/utils/useAppTheme"
import { AlertItem } from "./AlertCard"
import { CloudSun, Zap, BusFront, Calendar } from "lucide-react-native"
import { TrafficAlertItem } from "@/models/TrafficAlert"

export interface EnhancedAlertCardProps {
  item: PoliceNewsItem | AlertItem | TrafficAlertItem
  onPress?: () => void
  categoryColor?: string
}

export const EnhancedAlertCard = observer(function EnhancedAlertCard({ 
  item, 
  onPress, 
  categoryColor 
}: EnhancedAlertCardProps) {
  const { themed, theme } = useAppTheme()
  
  // Get the item's category (if it's an AlertItem) or default to "police" for PoliceNewsItem
  const category = 'category' in item ? item.category : 
                   'eventType' in item ? "traffic" : "police"
  
  // Get the appropriate icon based on category
  const getIcon = () => {
    switch (category) {
      case "weather":
        return <CloudSun size={16} color={categoryColor || theme.colors.weather} />
      case "police":
        return (
          <Image 
            source={require("../../assets/favicons/ottpolice.png")}
            style={themed($policeIcon)}
          />
        )
      case "hydro": 
        return <Zap size={16} color={categoryColor || theme.colors.hydro} />
      case "traffic":
        return <BusFront size={16} color={categoryColor || theme.colors.traffic} />
      default:
        return <Image 
          source={require("../../assets/favicons/ottpolice.png")}
          style={themed($policeIcon)}
        />
    }
  }

  // Get color based on category
  const getColor = () => {
    if (categoryColor) return categoryColor;
    
    if (category === "weather") return theme.colors.weather;
    if (category === "police") return theme.colors.police;
    if (category === "hydro") return theme.colors.hydro;
    if (category === "traffic") return theme.colors.traffic;
    
    return theme.colors.tint;
  }

  // Format date from item
  const getFormattedDate = () => {
    if (item.formattedDate) return item.formattedDate;
    
    if ('date' in item && item.date) {
      try {
        return new Date(item.date).toLocaleDateString();
      } catch (e) {
        return '';
      }
    }
    
    if ('created' in item && item.created) {
      try {
        return new Date(item.created).toLocaleDateString();
      } catch (e) {
        return '';
      }
    }
    
    return ('timestamp' in item) ? item.timestamp : '';
  }
  
  // Get title from item
  const getTitle = () => {
    if ('improvedHeadline' in item && item.improvedHeadline) return item.improvedHeadline;
    if ('headline' in item) return item.headline;
    if (item.title) return item.title;
    if ('message' in item) return item.message;
    return "";
  }
  
  // Get description from item
  const getDescription = () => {
    if ('headline' in item && 'message' in item) return item.message;
    if (item.excerpt) return item.excerpt;
    if ('message' in item && !item.title) return "";
    
    // Include locations affected for weather alerts if available
    if ('locationsAffected' in item && Array.isArray(item.locationsAffected) && item.locationsAffected.length > 0) {
      const locations = item.locationsAffected.join(", ");
      if (item.excerpt) {
        return `${item.excerpt}\n\nRegions affected: ${locations}`;
      }
      return `Regions affected: ${locations}`;
    }
    
    return "";
  }
  
  // Check if item has an event type tag
  const hasEventTypeTag = () => {
    return 'eventType' in item && item.eventType;
  }

  // Format schedule dates for traffic alerts
  const getScheduleInfo = () => {
    if (!('schedule' in item) || !item.schedule || item.schedule.length === 0) return null;
    
    // Get the most relevant schedule item (first one)
    const scheduleItem = item.schedule[0];
    
    if (!scheduleItem.startDateTime && !scheduleItem.endDateTime) return null;
    
    const formatDate = (dateStr: string) => {
      if (!dateStr) return "";
      try {
        const date = new Date(dateStr);
        return date.toLocaleDateString(undefined, { 
          month: 'short', 
          day: 'numeric', 
          hour: 'numeric', 
          minute: '2-digit'
        });
      } catch (e) {
        return dateStr;
      }
    };
    
    const startDate = formatDate(scheduleItem.startDateTime);
    const endDate = formatDate(scheduleItem.endDateTime);
    
    if (startDate && endDate) {
      return `${startDate} — ${endDate}`;
    } else if (startDate) {
      return `Starts: ${startDate}`;
    } else if (endDate) {
      return `Ends: ${endDate}`;
    }
    
    return null;
  };

  // Check if the item has a schedule
  const hasSchedule = () => {
    return 'schedule' in item && item.schedule && item.schedule.length > 0 &&
           (item.schedule[0].startDateTime || item.schedule[0].endDateTime);
  };

  return (
    <Pressable
      style={themed($container)}
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={getTitle()}
      accessibilityHint="Opens the full details in your browser"
    >
      <View style={themed($header)}>
        <View style={themed($sourceContainer)}>
          {getIcon()}
          <Text 
            text={
              'source' in item ? item.source : 
              'generation_source' in item ? (item.generation_source === "MTO" ? "Ministry of Transportation" : "City of Ottawa Traffic") : 
              "Ottawa Police"
            } 
            style={[
              themed($source), 
              { color: getColor() }
            ]} 
          />
        </View>
        
        {hasEventTypeTag() && (
          <View style={[themed($tagContainer), { backgroundColor: getColor() }]}>
            <Text text={('eventType' in item) ? item.eventType : ""} style={themed($tagText)} />
          </View>
        )}
      </View>

      <Text
        text={getTitle()}
        style={themed($title)}
        numberOfLines={3}
      />

      <Text 
        text={getDescription()} 
        style={themed($description)} 
        numberOfLines={3} 
      />
      
      {hasSchedule() && (
        <View style={themed($scheduleContainer)}>
          <Calendar size={14} color={getColor()} />
          <Text text={getScheduleInfo() || ""} style={themed($scheduleText)} />
        </View>
      )}
      
      <View style={themed($footer)}>
        <Text 
          text={getFormattedDate()} 
          style={themed($date)} 
          numberOfLines={1} 
        />
      </View>
    </Pressable>
  )
})

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors, spacing, radius }) => ({
  backgroundColor: colors.containerBackground,
  borderRadius: radius.md,
  padding: spacing.sm,
  marginVertical: spacing.xs,
  marginHorizontal: 0,
  borderWidth: 1,
  borderColor: colors.border,
  // category is carried by the colored icon + source label, not a side-stripe
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2.22,
  elevation: 2,
})

const $policeIcon: ThemedStyle<ImageStyle> = () => ({
  width: 16,
  height: 16,
  resizeMode: 'contain',
})

const $header: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
  flexWrap: "nowrap",
})

const $sourceContainer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
})

const $tagContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: 4,
  alignSelf: "flex-start",
})

const $tagText: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.xxs,
  fontWeight: "bold",
  color: "white",
  textTransform: "uppercase",
})

const $source: ThemedStyle<TextStyle> = ({ typography }) => ({
  fontSize: typography.sizes.xs,
  fontWeight: typography.weights.semiBold,
})

const $title: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.md,
  fontWeight: typography.weights.semiBold,
  color: colors.text,
  marginBottom: 8,
})

const $description: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.sm,
  color: colors.text,
  opacity: 0.8,
  marginBottom: 8,
})

const $scheduleContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.xs,
  gap: 4,
})

const $scheduleText: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.8,
  flex: 1,
})

const $footer: ThemedStyle<ViewStyle> = () => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $date: ThemedStyle<TextStyle> = ({ colors, typography }) => ({
  fontSize: typography.sizes.xs,
  color: colors.text,
  opacity: 0.7,
  flexShrink: 1,
}) 